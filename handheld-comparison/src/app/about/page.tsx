import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">About</h1>
              <p className="text-gray-600 mt-1">Learn more about our handheld comparison platform</p>
            </div>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About Handheld Gaming Comparison Hub</h2>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to the ultimate destination for handheld gaming device comparisons. Our platform is designed to help 
              gamers make informed decisions when choosing their next portable gaming device.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 mb-6">
              We believe that choosing the right handheld gaming device should be easy and transparent. Our comprehensive 
              comparison tools provide detailed specifications, performance metrics, and real-world testing results to help 
              you find the perfect gaming companion.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">What We Offer</h3>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li><strong>Detailed Comparisons:</strong> Side-by-side specifications and feature comparisons</li>
              <li><strong>Performance Benchmarks:</strong> Real-world gaming performance and battery life tests</li>
              <li><strong>Up-to-Date Information:</strong> Latest device releases and updated specifications</li>
              <li><strong>User Reviews:</strong> Community-driven insights and experiences</li>
              <li><strong>Price Tracking:</strong> Current pricing and availability information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Sources</h3>
            <p className="text-gray-600 mb-6">
              Our data is sourced from official manufacturer specifications, independent testing, and community contributions. 
              We maintain a Google Sheets database that's regularly updated with the latest information to ensure accuracy 
              and timeliness.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Technology Stack</h3>
            <p className="text-gray-600 mb-6">
              This platform is built with modern web technologies including Next.js, TypeScript, and TailwindCSS. 
              We use Google Sheets API for data management, ensuring real-time updates and reliable data access.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Get Started</h4>
              <p className="text-blue-700 mb-4">
                Ready to compare handheld gaming devices? Head over to our comparison tool to start exploring.
              </p>
              <Link 
                href="/compare"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Comparing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 