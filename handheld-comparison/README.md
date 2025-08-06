# Handheld Gaming Comparison Hub

A Next.js application for comparing handheld gaming devices with real-time data from Google Sheets.

## Features

- **Homepage with Hero Banner**: Beautiful landing page with introduction and feature highlights
- **Device Comparison Tool**: Interactive comparison table for handheld gaming devices
- **Google Sheets Integration**: Real-time data fetching from Google Sheets API
- **Responsive Design**: Modern UI built with TailwindCSS
- **TypeScript Support**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Data Source**: Google Sheets API
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Platform account (for Google Sheets API)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd handheld-comparison
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
# Google Sheets API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
```

### Google Sheets Setup

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a Service Account and download the JSON credentials
4. Create a Google Sheet with the following columns:
   - Name
   - Brand
   - Processor
   - RAM
   - Storage
   - Display
   - Battery
   - Price
   - Release Date
   - Image URL

5. Share the Google Sheet with your service account email

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── handhelds/
│   │       └── route.ts          # Google Sheets API endpoint
│   ├── compare/
│   │   └── page.tsx              # Device comparison page
│   ├── about/
│   │   └── page.tsx              # About page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
```

## API Endpoints

### GET /api/handhelds

Returns a list of handheld gaming devices with their specifications.

**Response:**
```json
[
  {
    "id": "1",
    "name": "Steam Deck OLED",
    "brand": "Valve",
    "processor": "AMD APU 6nm",
    "ram": "16GB LPDDR5",
    "storage": "512GB/1TB NVMe SSD",
    "display": "7.4\" OLED 1280x800",
    "battery": "50Whr (2-8 hours)",
    "price": "$549/$649",
    "releaseDate": "2023-11-16",
    "imageUrl": "/images/steam-deck-oled.jpg"
  }
]
```

## Pages

### Homepage (`/`)
- Hero banner with introduction
- Feature highlights
- Call-to-action buttons

### Compare (`/compare`)
- Device selection interface
- Interactive comparison table
- Real-time data loading

### About (`/about`)
- Project information
- Technology stack details
- Setup instructions

## Customization

### Adding New Devices

1. Update the Google Sheet with new device data
2. The API will automatically fetch the updated data
3. No code changes required

### Styling

The application uses TailwindCSS for styling. Custom styles can be added to `src/app/globals.css`.

### Environment Variables

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google Cloud service account email
- `GOOGLE_PRIVATE_KEY`: Google Cloud service account private key
- `GOOGLE_SHEET_ID`: Google Sheets document ID

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open an issue on GitHub.
