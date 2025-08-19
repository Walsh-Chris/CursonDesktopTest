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
  // All additional data using actual column names
  additionalData: {
    [columnName: string]: string // All extra columns beyond the basic 6
  }
}

export default function ComparePage() {
  const [handhelds, setHandhelds] = useState<Handheld[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedHandhelds, setSelectedHandhelds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchHandhelds()
  }, [])

  const fetchHandhelds = async () => {
    try {
      setLoading(true)
      
      // Add cache busting to ensure we get fresh data with new images
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/handhelds?t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch handheld data: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`✅ Frontend received ${data.length} handhelds`)
      console.log('First 3 image URLs:', data.slice(0, 3).map((h: any) => `${h.name}: ${h.imageURL}`))
      setHandhelds(data)
    } catch (err) {
      console.error('Error fetching handhelds:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
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

  // Filter handhelds based on search query
  const filteredHandhelds = handhelds.filter(handheld => 
    handheld.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    handheld.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    handheld.releaseYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
    handheld.performanceScore.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                      
                      {/* Search Bar */}
                      <div className="mb-6">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search by name, brand, year, or form factor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {searchQuery && (
                          <p className="mt-2 text-sm text-gray-600">
                            Showing {filteredHandhelds.length} of {handhelds.length} devices
                          </p>
                        )}
                      </div>
                      
                      {filteredHandhelds.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No devices found</h3>
                          <p className="text-gray-500 mb-4">Try adjusting your search terms or clearing the search.</p>
                          <button
                            onClick={() => setSearchQuery('')}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Clear search
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredHandhelds.map((handheld) => (
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                  />
                                                  <div className="flex-shrink-0 w-20 h-16 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                                  <img
                                    src={handheld.imageURL}
                                    alt={handheld.name}
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      console.log(`Image failed to load: ${target.src} for ${handheld.name}`);
                                      target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400';
                                    }}
                                  />
                                </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate">{handheld.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{handheld.brand}</p>
                    <p className="text-xs text-gray-400 truncate">{handheld.releaseYear}</p>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selectedHandheldData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specification
                    </th>
                    {selectedHandheldData.map((handheld) => (
                      <th key={handheld.name} className="w-52 px-6 py-3 text-center">
                                                            <div className="flex flex-col items-center space-y-2">
                                      <div className="w-16 h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                                        <img
                                          src={handheld.imageURL}
                                          alt={handheld.name}
                                          className="max-w-full max-h-full object-contain rounded-lg"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            console.log(`Image failed to load: ${target.src} for ${handheld.name}`);
                                            target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400';
                                          }}
                                        />
                                      </div>
                                      <div className="text-xs font-medium text-gray-900 text-center break-words">
                                        {handheld.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {handheld.brand}
                                      </div>
                                    </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="break-words" style={{ wordBreak: 'break-word', hyphens: 'auto', maxWidth: '200px' }}>
                        Brand
                      </div>
                    </td>
                    {selectedHandheldData.map((handheld) => (
                      <td key={handheld.name} className="px-6 py-4 text-sm text-gray-900">
                        <div className="break-words" style={{ wordBreak: 'break-word', hyphens: 'auto', maxWidth: '200px' }}>
                          {handheld.brand}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="break-words" style={{ wordBreak: 'break-word', hyphens: 'auto', maxWidth: '200px' }}>
                        Price
                      </div>
                    </td>
                    {selectedHandheldData.map((handheld) => (
                      <td key={handheld.name} className="px-6 py-4 text-sm text-gray-900">
                        <div className="break-words" style={{ wordBreak: 'break-word', hyphens: 'auto', maxWidth: '200px' }}>
                          {handheld.price}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="break-words" style={{ wordBreak: 'break-word', hyphens: 'auto', maxWidth: '200px' }}>
                        Release Year
                      </div>
                    </td>
                    {selectedHandheldData.map((handheld) => (
                      <td key={handheld.name} className="px-6 py-4 text-sm text-gray-900">
                        <div className="break-words" style={{ wordBreak: 'break-word', hyphens: 'auto', maxWidth: '200px' }}>
                          {handheld.releaseYear}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="break-words" style={{ wordBreak: 'break-word', hyphens: 'auto', maxWidth: '200px' }}>
                        Performance Score
                      </div>
                    </td>
                    {selectedHandheldData.map((handheld) => (
                      <td key={handheld.name} className="px-6 py-4 text-sm text-gray-900">
                        <div className="break-words" style={{ wordBreak: 'break-word', hyphens: 'auto', maxWidth: '200px' }}>
                          {handheld.performanceScore}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="break-words" style={{ wordBreak: 'break-word', hyphens: 'auto', maxWidth: '200px' }}>
                        Image
                      </div>
                    </td>
                    {selectedHandheldData.map((handheld) => (
                      <td key={handheld.name} className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col items-center space-y-2">
                                      <div className="w-32 h-24 bg-gray-50 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                                        <img
                                          src={handheld.imageURL}
                                          alt={handheld.name}
                                          className="max-w-full max-h-full object-contain rounded-lg"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            console.log(`Image failed to load: ${target.src} for ${handheld.name}`);
                                            target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400';
                                          }}
                                        />
                                      </div>
                                      <a
                                        href={handheld.imageURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                                      >
                                        View Full Size
                                      </a>
                                    </div>
                      </td>
                    ))}
                  </tr>
                  
                  {/* Additional Data Section using actual column names */}
                  {selectedHandheldData.some(h => Object.keys(h.additionalData || {}).length > 0) && (
                    <>
                      <tr className="bg-blue-50">
                        <td colSpan={selectedHandheldData.length + 1} className="px-6 py-3 text-sm font-bold text-blue-900 border-t-2 border-blue-200">
                          📊 ADDITIONAL DATA
                        </td>
                      </tr>
                      {/* Get all unique column names from additional data */}
                      {Array.from(new Set(selectedHandheldData.flatMap(h => Object.keys(h.additionalData || {})))).map((columnName) => (
                        <tr key={`additional-${columnName}`}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div className="break-words" style={{ wordBreak: 'break-word', hyphens: 'auto', maxWidth: '200px' }}>
                              {columnName}
                            </div>
                          </td>
                          {selectedHandheldData.map((handheld) => (
                            <td key={handheld.name} className="px-6 py-4 text-sm text-gray-900">
                              <div className="max-w-xs break-words" style={{ wordBreak: 'break-word', hyphens: 'auto', maxWidth: '200px' }}>
                                {handheld.additionalData?.[columnName] || 'N/A'}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  )}
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