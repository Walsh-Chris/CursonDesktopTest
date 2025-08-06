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

// Fallback sample data since the Google Sheet structure is complex
const fallbackHandhelds: Handheld[] = [
  {
    name: "Steam Deck OLED",
    brand: "Valve",
    price: "$549-$649",
    releaseYear: "2023",
    performanceScore: "High",
    imageURL: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400"
  },
  {
    name: "ROG Ally",
    brand: "ASUS",
    price: "$699",
    releaseYear: "2023",
    performanceScore: "High",
    imageURL: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400"
  },
  {
    name: "Lenovo Legion Go",
    brand: "Lenovo",
    price: "$699-$799",
    releaseYear: "2023",
    performanceScore: "High",
    imageURL: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400"
  },
  {
    name: "Nintendo Switch OLED",
    brand: "Nintendo",
    price: "$349",
    releaseYear: "2021",
    performanceScore: "Medium",
    imageURL: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400"
  },
  {
    name: "AYANEO 2S",
    brand: "AYANEO",
    price: "$999-$1,499",
    releaseYear: "2023",
    performanceScore: "High",
    imageURL: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400"
  },
  {
    name: "Retroid Pocket 4 Pro",
    brand: "Retroid",
    price: "$199",
    releaseYear: "2024",
    performanceScore: "Medium",
    imageURL: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400"
  },
  {
    name: "Miyoo Mini Plus",
    brand: "Miyoo",
    price: "$79",
    releaseYear: "2023",
    performanceScore: "Low",
    imageURL: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400"
  },
  {
    name: "Anbernic RG35XX",
    brand: "Anbernic",
    price: "$59",
    releaseYear: "2022",
    performanceScore: "Low",
    imageURL: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400"
  }
]

function isValidHandheldData(handheld: Handheld): boolean {
  // Check if the data looks like valid handheld information
  const validBrands = ['Valve', 'ASUS', 'Lenovo', 'Nintendo', 'AYANEO', 'Retroid', 'Miyoo', 'Anbernic', 'Steam', 'ROG', 'Legion']
  const validPerformanceScores = ['High', 'Medium', 'Low']
  
  // Check if brand is in our known list
  const hasValidBrand = validBrands.some(brand => 
    handheld.brand.toLowerCase().includes(brand.toLowerCase())
  )
  
  // Check if performance score is valid
  const hasValidPerformanceScore = validPerformanceScores.some(score => 
    handheld.performanceScore.toLowerCase().includes(score.toLowerCase())
  )
  
  // Check if price looks like a real price (must contain $)
  const hasValidPrice = handheld.price.includes('$')
  
  // Check if release year is a 4-digit year
  const hasValidReleaseYear = /^\d{4}$/.test(handheld.releaseYear)
  
  // All conditions must be met for valid data
  return hasValidBrand && hasValidPerformanceScore && hasValidPrice && hasValidReleaseYear
}

async function fetchFromGoogleSheets(): Promise<Handheld[]> {
  const spreadsheetId = '1RUNo61MCcR6FJbMU2fOkJ2OCXNWtY-4cQ1J6F-KcGdo'
  const range = 'A:F' // Assuming columns A-F contain our data
  
  // For public sheets, we can use a simple fetch
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&range=${range}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const csvText = await response.text()
    const lines = csvText.split('\n').filter(line => line.trim() !== '')
    
    // Skip header row and parse data
    const handhelds: Handheld[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      // Parse CSV line (handle quoted values)
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim()) // Add the last value
      
      // Filter out entries that don't have proper data
      if (values.length >= 6 && 
          values[0] && values[0].trim() !== '' && 
          values[1] && values[1].trim() !== '' &&
          !values[0].includes('Donations') &&
          !values[0].includes('Handheld') &&
          values[0].length < 100) { // Avoid very long entries that might be headers
        
        const handheld: Handheld = {
          name: values[0].replace(/"/g, '').trim() || '',
          brand: values[1].replace(/"/g, '').trim() || '',
          price: values[2].replace(/"/g, '').trim() || '',
          releaseYear: values[3].replace(/"/g, '').trim() || '',
          performanceScore: values[4].replace(/"/g, '').trim() || '',
          imageURL: values[5].replace(/"/g, '').trim() || ''
        }
        
        // Only add if it looks like valid handheld data
        if (isValidHandheldData(handheld)) {
          handhelds.push(handheld)
        }
      }
    }
    
    // Filter out duplicates and clean up the data
    const uniqueHandhelds = handhelds.filter((handheld, index, self) => 
      index === self.findIndex(h => h.name === handheld.name && h.brand === handheld.brand)
    ).filter(handheld => 
      handheld.name && 
      handheld.brand && 
      handheld.name.length > 0 && 
      handheld.brand.length > 0 &&
      !handheld.name.includes('undefined') &&
      !handheld.brand.includes('undefined')
    )
    
    // If we don't get valid data from the sheet, return fallback data
    if (uniqueHandhelds.length === 0) {
      console.log('No valid data found in Google Sheet, using fallback data')
      return fallbackHandhelds
    }
    
    return uniqueHandhelds
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error)
    console.log('Using fallback data due to error')
    return fallbackHandhelds
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
    
    // Return fallback data if no cache available
    return NextResponse.json(fallbackHandhelds, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'X-Cache': 'FALLBACK'
      }
    })
  }
} 