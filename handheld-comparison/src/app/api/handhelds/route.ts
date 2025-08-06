import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Mock data for development - replace with actual Google Sheets integration
const mockHandhelds = [
  {
    id: '1',
    name: 'Steam Deck OLED',
    brand: 'Valve',
    processor: 'AMD APU 6nm',
    ram: '16GB LPDDR5',
    storage: '512GB/1TB NVMe SSD',
    display: '7.4" OLED 1280x800',
    battery: '50Whr (2-8 hours)',
    price: '$549/$649',
    releaseDate: '2023-11-16',
    imageUrl: '/images/steam-deck-oled.jpg'
  },
  {
    id: '2',
    name: 'ROG Ally',
    brand: 'ASUS',
    processor: 'AMD Ryzen Z1 Extreme',
    ram: '16GB LPDDR5',
    storage: '512GB NVMe SSD',
    display: '7" IPS 1920x1080',
    battery: '40Whr (2-6 hours)',
    price: '$699',
    releaseDate: '2023-06-13',
    imageUrl: '/images/rog-ally.jpg'
  },
  {
    id: '3',
    name: 'Lenovo Legion Go',
    brand: 'Lenovo',
    processor: 'AMD Ryzen Z1 Extreme',
    ram: '16GB LPDDR5',
    storage: '256GB/512GB/1TB NVMe SSD',
    display: '8.8" IPS 2560x1600',
    battery: '49.2Whr (2-8 hours)',
    price: '$699/$749/$799',
    releaseDate: '2023-10-31',
    imageUrl: '/images/legion-go.jpg'
  },
  {
    id: '4',
    name: 'Nintendo Switch OLED',
    brand: 'Nintendo',
    processor: 'NVIDIA Tegra X1+',
    ram: '4GB LPDDR4',
    storage: '64GB eMMC',
    display: '7" OLED 1280x720',
    battery: '16Whr (4.5-9 hours)',
    price: '$349',
    releaseDate: '2021-10-08',
    imageUrl: '/images/switch-oled.jpg'
  },
  {
    id: '5',
    name: 'Ayaneo 2S',
    brand: 'Ayaneo',
    processor: 'AMD Ryzen 7 7840U',
    ram: '16GB/32GB LPDDR5',
    storage: '512GB/1TB/2TB NVMe SSD',
    display: '7" IPS 1920x1200',
    battery: '50.25Whr (2-6 hours)',
    price: '$999-$1,499',
    releaseDate: '2023-07-15',
    imageUrl: '/images/ayaneo-2s.jpg'
  }
]

export async function GET(request: NextRequest) {
  try {
    // For now, return mock data
    // TODO: Implement Google Sheets integration
    return NextResponse.json(mockHandhelds)
    
    /* 
    // Google Sheets integration (commented out for now)
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Handhelds!A2:J', // Assuming headers are in row 1
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    const handhelds = rows.map((row, index) => ({
      id: (index + 1).toString(),
      name: row[0] || '',
      brand: row[1] || '',
      processor: row[2] || '',
      ram: row[3] || '',
      storage: row[4] || '',
      display: row[5] || '',
      battery: row[6] || '',
      price: row[7] || '',
      releaseDate: row[8] || '',
      imageUrl: row[9] || '',
    }))

    return NextResponse.json(handhelds)
    */
  } catch (error) {
    console.error('Error fetching handheld data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch handheld data' },
      { status: 500 }
    )
  }
} 