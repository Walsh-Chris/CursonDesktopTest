import { NextRequest, NextResponse } from 'next/server'

// Cache for storing the response
let cachedData: any = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

interface Handheld {
  name: string
  brand: string
  price: string
  releaseYear: string
  performanceScore: string
  imageURL: string
}

async function fetchFromGoogleSheets(): Promise<Handheld[]> {
  const spreadsheetId = '1RUNo61MCcR6FJbMU2fOkJ2OCXNWtY-4cQ1J6F-KcGdo'
  const range = 'A2:F11' // First 10 rows (skip header row)
  
  // For public sheets, we can use a simple fetch
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&range=${range}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const csvText = await response.text()
    
    // Reconstruct complete rows by handling newlines within quoted fields
    const handhelds: Handheld[] = []
    const lines = csvText.split('\n')
    
    let currentRow = ''
    let inQuotes = false
    let rowCount = 0
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Count quotes in this line
      const quoteCount = (line.match(/"/g) || []).length
      inQuotes = inQuotes ? (quoteCount % 2 === 0) : (quoteCount % 2 === 1)
      
      currentRow += line + '\n'
      
      // If we're not in quotes, we have a complete row
      if (!inQuotes && currentRow.trim()) {
        // Parse the complete row
        const values: string[] = []
        let current = ''
        let inFieldQuotes = false
        let j = 0
        
        while (j < currentRow.length) {
          const char = currentRow[j]
          
          if (char === '"') {
            if (inFieldQuotes && j + 1 < currentRow.length && currentRow[j + 1] === '"') {
              // Handle escaped quotes
              current += '"'
              j += 2
            } else {
              inFieldQuotes = !inFieldQuotes
              j++
            }
          } else if (char === ',' && !inFieldQuotes) {
            values.push(current.trim())
            current = ''
            j++
          } else {
            current += char
            j++
          }
        }
        values.push(current.trim()) // Add the last value
        
        // Map columns: A=Image (empty), B=Name, C=Brand, D=Released, E=Form Factor, F=OS
        if (values.length >= 6 && 
            values[1] && values[1].trim() !== '' && 
            values[2] && values[2].trim() !== '') {
          
          const handheld: Handheld = {
            name: values[1].replace(/"/g, '').trim() || '', // Column B: Name
            brand: values[2].replace(/"/g, '').trim() || '', // Column C: Brand
            price: 'TBD', // No price column, set as TBD
            releaseYear: values[3].replace(/"/g, '').trim() || '', // Column D: Released
            performanceScore: values[4].replace(/"/g, '').trim() || '', // Column E: Form Factor
            imageURL: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400' // Default image since column A is empty
          }
          
          handhelds.push(handheld)
        }
        
        currentRow = ''
        rowCount++
      }
    }
    
    return handhelds
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const now = Date.now()
    
    // Check if we have valid cached data
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, max-age=3600', // 1 hour
          'X-Cache': 'HIT'
        }
      })
    }
    
    // Fetch fresh data from Google Sheets
    const handhelds = await fetchFromGoogleSheets()
    
    // Update cache
    cachedData = handhelds
    cacheTimestamp = now
    
    return NextResponse.json(handhelds, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // 1 hour
        'X-Cache': 'MISS'
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