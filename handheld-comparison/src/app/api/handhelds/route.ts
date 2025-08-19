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



async function fetchFromODSFile(): Promise<Handheld[]> {
  const odsFilePath = path.join(process.cwd(), 'data', 'Handhelds.ods')
  
  try {
    // Parse ODS file
    const handhelds = await parseODSFile(odsFilePath)
    
    // Remove duplicates based on name
    const uniqueHandhelds = handhelds.filter((handheld, index, self) => 
      index === self.findIndex(h => h.name === handheld.name)
    )
    
    // Limit to 505 entries (rows 2-506 in the spreadsheet)
    const limitedHandhelds = uniqueHandhelds.slice(0, 505)
    console.log(`📊 ODS file parsed: ${handhelds.length} total, ${uniqueHandhelds.length} unique, limited to ${limitedHandhelds.length} consoles`)
    
    return limitedHandhelds
  } catch (error) {
    console.error('Error parsing ODS file:', error)
    throw error
  }
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
    
    // Fetch fresh data from ODS file
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