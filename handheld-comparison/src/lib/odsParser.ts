import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import { DOMParser } from 'xmldom'

interface Handheld {
  name: string
  brand: string
  price: string
  releaseYear: string
  performanceScore: string
  imageURL: string
}

export async function parseODSFile(filePath: string): Promise<Handheld[]> {
  console.log('Attempting to parse ODS file at:', filePath)
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`ODS file not found at ${filePath}`)
    }

    // Extract ODS file (which is a ZIP archive)
    const zip = new AdmZip(filePath)
    const entries = zip.getEntries()
    
    // Extract content.xml for spreadsheet data
    const contentEntry = entries.find(entry => entry.entryName === 'content.xml')
    if (!contentEntry) {
      throw new Error('content.xml not found in ODS file')
    }
    
    const contentXml = contentEntry.getData().toString('utf8')
    
    // Extract images from Pictures directory
    const imageEntries = entries.filter(entry => 
      entry.entryName.startsWith('Pictures/') && 
      (entry.entryName.endsWith('.jpg') || 
       entry.entryName.endsWith('.png') || 
       entry.entryName.endsWith('.gif') ||
       entry.entryName.endsWith('.jpeg'))
    )
    
    // Extract images to public directory
    const publicImagesDir = path.join(process.cwd(), 'public', 'handheld-images')
    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true })
    }
    
    // Save extracted images
    const imageMap: { [key: string]: string } = {}
    console.log(`Found ${imageEntries.length} images in ODS file`)
    imageEntries.forEach((entry, index) => {
      const imageName = `device_${index + 1}${path.extname(entry.entryName)}`
      const imagePath = path.join(publicImagesDir, imageName)
      fs.writeFileSync(imagePath, entry.getData())
      imageMap[entry.entryName] = `/handheld-images/${imageName}`
      console.log(`Extracted image: ${entry.entryName} -> ${imageName}`)
    })
    
    // Parse XML content
    const parser = new DOMParser()
    const doc = parser.parseFromString(contentXml, 'text/xml')
    
    // Extract table data
    const rows = doc.getElementsByTagName('table:table-row')
    const handhelds: Handheld[] = []
    
    // Create a mapping of row index to image references
    const rowImageMap: { [key: number]: string } = {}
    
    // Skip header row (index 0), start from index 1
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const cells = row.getElementsByTagName('table:table-cell')
      
      if (cells.length >= 6) {
        // Extract text values from cells and check for images
        const values: string[] = []
        let hasImageInColumnA = false
        
        for (let j = 0; j < 6; j++) {
          const cell = cells[j]
          const textElements = cell.getElementsByTagName('text:p')
          let cellValue = ''
          
          // Check for images in Column A (j === 0)
          if (j === 0) {
            const images = cell.getElementsByTagName('draw:image')
            if (images.length > 0) {
              hasImageInColumnA = true
              const imageRef = images[0].getAttribute('xlink:href')
              if (imageRef) {
                rowImageMap[i] = imageRef
              }
            }
          }
          
          if (textElements.length > 0) {
            cellValue = textElements[0].textContent || ''
          }
          
          values.push(cellValue.trim())
        }
        
        // Map columns: A=Image, B=Name, C=Brand, D=Released, E=Form Factor, F=OS
        const deviceName = values[1] ? values[1].trim() : '' // Column B: Name
        const imageColumnA = values[0] ? values[0].trim() : '' // Column A: Image reference
        
        // Only process rows with valid device names (not just numbers or empty)
        if (deviceName && deviceName !== '' && deviceName !== 'TBA' && 
            !deviceName.match(/^\d+$/) && // Skip rows that are just numbers
            deviceName.length > 1) { // Skip single character names
          
          // Determine image URL based on Column A or use placeholder
          let imageURL = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400' // Default placeholder
          
          // If this row has an image in Column A, use it
          if (hasImageInColumnA && rowImageMap[i]) {
            const imageRef = rowImageMap[i]
            // Check if we have this image in our imageMap
            if (imageMap[imageRef]) {
              imageURL = imageMap[imageRef]
            } else {
              // Try to find image by reference name
              const imageName = imageRef.split('/').pop()
              const matchingImage = Object.keys(imageMap).find(key => 
                key.includes(imageName || '')
              )
              if (matchingImage) {
                imageURL = imageMap[matchingImage]
              }
            }
          } else if (imageColumnA && imageColumnA !== '' && imageColumnA !== 'TBA') {
            // Fallback: Use extracted images in order if Column A has some reference
            const imageIndex = i - 1 // Adjust for header row
            const availableImages = Object.values(imageMap)
            if (availableImages.length > imageIndex && imageIndex >= 0) {
              imageURL = availableImages[imageIndex]
            }
          }
          
          const handheld: Handheld = {
            name: deviceName,
            brand: values[2] && values[2].trim() !== '' ? values[2].trim() : 'TBA', // Column C: Brand
            price: 'TBA', // No price column in current structure
            releaseYear: values[3] && values[3].trim() !== '' ? values[3].trim() : 'TBA', // Column D: Released
            performanceScore: values[4] && values[4].trim() !== '' ? values[4].trim() : 'TBA', // Column E: Form Factor
            imageURL: imageURL
          }
          
          handhelds.push(handheld)
        }
      }
    }
    
    return handhelds
    
  } catch (error) {
    console.error('Error parsing ODS file:', error)
    throw error
  }
}