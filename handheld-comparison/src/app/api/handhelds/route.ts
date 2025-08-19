import { NextRequest, NextResponse } from 'next/server'
import { parseODSFile } from '@/lib/odsParser'
import path from 'path'

// Cache for storing the response
let cachedData: Handheld[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

interface Handheld {
  name: string
  brand: string
  price: string
  releaseYear: string
  performanceScore: string
  imageURL: string
  // All additional data using actual column names
  additionalData: {
    [columnName: string]: string // All extra columns beyond the basic 6
  }
}

function getDeviceImageURL(deviceName: string): string {
  // Map specific devices to real images
  const deviceImageMap: { [key: string]: string } = {
    'XU20 V32': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400',
    'Mangmi Air X': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
    'One 35': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    'Flip 1S': 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=400',
    'ROG Ally': 'https://images.unsplash.com/photo-1612198762602-fcdbac833d40?w=400',
    'ROG Ally X': 'https://images.unsplash.com/photo-1612198762602-fcdbac833d40?w=400',
    'Steam Deck': 'https://images.unsplash.com/photo-1612198762602-fcdbac833d40?w=400',
    'Steam Deck OLED': 'https://images.unsplash.com/photo-1612198762602-fcdbac833d40?w=400',
    'Legion Go': 'https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=400',
    'Legion Go Gen 2': 'https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=400'
  }
  
  // Check for exact match first
  if (deviceImageMap[deviceName]) {
    return deviceImageMap[deviceName]
  }
  
  // Check for partial matches
  const deviceLower = deviceName.toLowerCase()
  
  if (deviceLower.includes('steam deck')) {
    return 'https://images.unsplash.com/photo-1612198762602-fcdbac833d40?w=400'
  } else if (deviceLower.includes('rog ally') || deviceLower.includes('asus')) {
    return 'https://images.unsplash.com/photo-1612198762602-fcdbac833d40?w=400'
  } else if (deviceLower.includes('legion go') || deviceLower.includes('lenovo')) {
    return 'https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=400'
  } else if (deviceLower.includes('ayaneo')) {
    return 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=400'
  } else if (deviceLower.includes('retroid')) {
    return 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400'
  } else if (deviceLower.includes('anbernic')) {
    return 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'
  }
  
  // Default gaming handheld image
  return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400'
}

async function fetchFromODSFile(): Promise<Handheld[]> {
  const odsFilePath = path.join(process.cwd(), 'data', 'Handhelds.ods')
  
  try {
    // Try to parse ODS file first
    const handhelds = await parseODSFile(odsFilePath)
    
    // Limit to 505 entries (rows 2-506 in the spreadsheet)
    const limitedHandhelds = handhelds.slice(0, 505)
    console.log(`📊 ODS file parsed: ${handhelds.length} total, limited to ${limitedHandhelds.length} consoles`)
    
    return limitedHandhelds
  } catch (error) {
    console.error('Error parsing ODS file, falling back to Google Sheets:', error)
    
    // Fallback to Google Sheets if ODS file fails
    return await fetchFromGoogleSheetsBackup()
  }
}

async function fetchFromGoogleSheetsBackup(): Promise<Handheld[]> {
  const spreadsheetId = '1RUNo61MCcR6FJbMU2fOkJ2OCXNWtY-4cQ1J6F-KcGdo'
  
  // Fetch data in chunks to avoid concatenation issues with large ranges
  const allHandhelds: Handheld[] = []
  const chunkSize = 100
  const maxRows = 510
  
  for (let startRow = 2; startRow <= maxRows; startRow += chunkSize) {
    const endRow = Math.min(startRow + chunkSize - 1, maxRows)
    const range = `A${startRow}:F${endRow}`
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&range=${range}`
    
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const csvText = await response.text()
      
      // Use a simple line-by-line approach for better reliability
      const handhelds: Handheld[] = []
    
    // Split by lines first - this will give us each logical CSV row
    const lines = csvText.split('\n')
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      let line = lines[lineIndex].trim()
      if (!line) continue
      
      // Handle multi-line quoted fields by continuing to read lines
      // until we have balanced quotes
      let quoteCount = (line.match(/"/g) || []).length
      while (quoteCount % 2 !== 0 && lineIndex + 1 < lines.length) {
        lineIndex++
        line += '\n' + lines[lineIndex]
        quoteCount = (line.match(/"/g) || []).length
      }
      
      // Parse this complete row
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            // Handle escaped quotes
            current += '"'
            i++ // Skip the next quote
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim()) // Add the last value
      
      // Map columns: A=Image (empty), B=Name, C=Brand, D=Released, E=Form Factor, F=OS
      // Only require name to be present, use TBA for missing data
      if (values.length >= 2 && values[1] && values[1].trim() !== '') {
        
                              const handheld: Handheld = {
                        name: values[1].replace(/"/g, '').trim() || 'TBA', // Column B: Name
                        brand: values[2] ? values[2].replace(/"/g, '').trim() || 'TBA' : 'TBA', // Column C: Brand
                        price: 'TBA', // No price column, set as TBA
                        releaseYear: values[3] ? values[3].replace(/"/g, '').trim() || 'TBA' : 'TBA', // Column D: Released
                        performanceScore: values[4] ? values[4].replace(/"/g, '').trim() || 'TBA' : 'TBA', // Column E: Form Factor
                        imageURL: values[0] ? values[0].replace(/"/g, '').trim() : getDeviceImageURL(values[1]) // Column A: Image or generate based on device name
                      }
        
        handhelds.push(handheld)
      }
    }
    
    // Add this chunk's handhelds to the total
    allHandhelds.push(...handhelds)
    
    } catch (error) {
      console.error(`Error fetching chunk ${range}:`, error)
      // Continue with other chunks even if one fails
    }
  }
  
  return allHandhelds
}

export async function GET(request: NextRequest) {
  try {
    const now = Date.now()
    
    // Check if we have valid cached data (but allow cache bypass for testing)
    const url = new URL(request.url)
    const bypassCache = url.searchParams.get('bypass') === 'true'
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : null
    
    if (!bypassCache && cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      const resultData = limit ? cachedData.slice(0, limit) : cachedData
      console.log(`📊 Cache HIT: returning ${resultData.length} of ${cachedData.length} total handhelds`)
      return NextResponse.json(resultData, {
        headers: {
          'Cache-Control': 'public, max-age=3600', // 1 hour
          'X-Cache': 'HIT',
          'X-Total-Count': cachedData.length.toString(),
          'X-Returned-Count': resultData.length.toString()
        }
      })
    }
    
    // Fetch fresh data from ODS file (with Google Sheets fallback)
    const handhelds = await fetchFromODSFile()
    
    // Update cache
    cachedData = handhelds
    cacheTimestamp = now
    
    // Apply limit if specified
    const resultData = limit ? handhelds.slice(0, limit) : handhelds
    console.log(`📊 Cache MISS: returning ${resultData.length} of ${handhelds.length} total handhelds`)
    
    return NextResponse.json(resultData, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // 1 hour
        'X-Cache': 'MISS',
        'X-Total-Count': handhelds.length.toString(),
        'X-Returned-Count': resultData.length.toString()
      }
    })
    
  } catch (error) {
    console.error('Error fetching handheld data:', error)
    
    // Return cached data if available, even if expired
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, max-age=3600',
          'X-Cache': 'STALE'
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch handheld data' },
      { status: 500 }
    )
  }
} 