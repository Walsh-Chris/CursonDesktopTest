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
    imageEntries.forEach((entry, index) => {
      const imageName = `device_${index + 1}${path.extname(entry.entryName)}`
      const imagePath = path.join(publicImagesDir, imageName)
      fs.writeFileSync(imagePath, entry.getData())
      imageMap[entry.entryName] = `/handheld-images/${imageName}`
    })
    
    // Parse XML content
    const parser = new DOMParser()
    const doc = parser.parseFromString(contentXml, 'text/xml')
    
    // Extract table data
    const rows = doc.getElementsByTagName('table:table-row')
    const handhelds: Handheld[] = []
    
    // Skip header row (index 0), start from index 1
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const cells = row.getElementsByTagName('table:table-cell')
      
      if (cells.length >= 6) {
        // Extract text values from cells
        const values: string[] = []
        for (let j = 0; j < 6; j++) {
          const cell = cells[j]
          const textElements = cell.getElementsByTagName('text:p')
          let cellValue = ''
          
          if (textElements.length > 0) {
            cellValue = textElements[0].textContent || ''
          }
          
          values.push(cellValue.trim())
        }
        
        // Map columns based on your spreadsheet structure
        const deviceName = values[1] // Column B: Name
        if (deviceName && deviceName !== '') {
          
          // Try to find corresponding image
          let imageURL = '/handheld-images/default.jpg' // Default image
          
          // Look for images by index or try to match by name
          const imageIndex = i - 1 // Adjust for header row
          if (imageMap[`Pictures/image${imageIndex}.jpg`]) {
            imageURL = imageMap[`Pictures/image${imageIndex}.jpg`]
          } else if (imageMap[`Pictures/image${imageIndex}.png`]) {
            imageURL = imageMap[`Pictures/image${imageIndex}.png`]
          } else {
            // Try to find any available image
            const availableImages = Object.values(imageMap)
            if (availableImages.length > 0) {
              imageURL = availableImages[imageIndex % availableImages.length]
            }
          }
          
          const handheld: Handheld = {
            name: deviceName,
            brand: values[2] || 'TBA', // Column C: Brand
            price: 'TBA', // Not in current structure
            releaseYear: values[3] || 'TBA', // Column D: Released
            performanceScore: values[4] || 'TBA', // Column E: Form Factor
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