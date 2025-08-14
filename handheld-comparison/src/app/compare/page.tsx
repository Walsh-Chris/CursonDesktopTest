'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Handheld {
  name: string
  brand: string
  price: string
  releaseYear: string
  performanceScore: string
  imageURL: string
}

export default function ComparePage() {
  const [handhelds, setHandhelds] = useState<Handheld[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedHandhelds, setSelectedHandhelds] = useState<string[]>([])

  useEffect(() => {
    fetchHandhelds()
  }, [])

  const fetchHandhelds = async () => {
    try {
      setLoading(true)
      
      // Add timeout to the fetch
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('/api/handhelds', {
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch handheld data: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`✅ Frontend received ${data.length} handhelds`)
      setHandhelds(data)
    } catch (err) {
      console.error('Error fetching handhelds:', err)
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleHandheldSelection = (name: string) => {
    setSelectedHandhelds(prev => 
      prev.includes(name) 
        ? prev.filter(h => h !== name)
        : [...prev, name]
    )
  }

  const selectedHandheldData = handhelds.filter(h => selectedHandhelds.includes(h.name))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading handheld data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchHandhelds}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Handheld Comparison</h1>
              <p className="text-gray-600 mt-1">Compare gaming handhelds side by side</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Device Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Devices to Compare</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {handhelds.map((handheld) => (
              <div 
                key={handheld.name}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedHandhelds.includes(handheld.name)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleHandheldSelection(handheld.name)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedHandhelds.includes(handheld.name)}
                    onChange={() => toggleHandheldSelection(handheld.name)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{handheld.name}</h3>
                    <p className="text-sm text-gray-500">{handheld.brand}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedHandheldData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specification
                    </th>
                    {selectedHandheldData.map((handheld) => (
                      <th key={handheld.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {handheld.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Brand</td>
                    {selectedHandheldData.map((handheld) => (
                      <td key={handheld.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {handheld.brand}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Price</td>
                    {selectedHandheldData.map((handheld) => (
                      <td key={handheld.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {handheld.price}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Release Year</td>
                    {selectedHandheldData.map((handheld) => (
                      <td key={handheld.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {handheld.releaseYear}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Performance Score</td>
                    {selectedHandheldData.map((handheld) => (
                      <td key={handheld.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {handheld.performanceScore}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Image</td>
                    {selectedHandheldData.map((handheld) => (
                      <td key={handheld.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {handheld.imageURL ? (
                          <a 
                            href={handheld.imageURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View Image
                          </a>
                        ) : (
                          'No image available'
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedHandheldData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No devices selected</h3>
            <p className="text-gray-500">Select at least one device from the list above to start comparing.</p>
          </div>
        )}
      </div>
    </div>
  )
} 