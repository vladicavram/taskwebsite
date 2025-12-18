const { PrismaClient } = require('@prisma/client')
const { put } = require('@vercel/blob')
const fs = require('fs')
const path = require('path')

async function main() {
  const prisma = new PrismaClient()
  
  const imagesDir = path.join(process.cwd(), 'downloaded-images')
  const metadataPath = path.join(imagesDir, 'metadata.json')
  
  if (!fs.existsSync(metadataPath)) {
    console.error('❌ Metadata file not found. Run download-unique-images.js first.')
    process.exit(1)
  }
  
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
  
  console.log(`\n📤 Uploading ${metadata.length} images to Vercel Blob...\n`)
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < metadata.length; i++) {
    const item = metadata[i]
    const progress = `[${i + 1}/${metadata.length}]`
    
    try {
      const imagePath = path.join(imagesDir, item.filename)
      
      if (!fs.existsSync(imagePath)) {
        console.log(`${progress} ❌ File not found: ${item.filename}`)
        errorCount++
        continue
      }
      
      const buffer = fs.readFileSync(imagePath)
      
      // Upload to Vercel Blob
      const blob = await put(`tasks/${item.taskId}.jpg`, buffer, {
        access: 'public',
        contentType: 'image/jpeg'
      })
      
      // Update task with new image URL
      await prisma.task.update({
        where: { id: item.taskId },
        data: { imageUrl: blob.url }
      })
      
      successCount++
      console.log(`${progress} ✅ ${item.title.substring(0, 50)}...`)
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      errorCount++
      console.log(`${progress} ❌ Error: ${error.message}`)
    }
  }
  
  console.log(`\n✅ Upload complete!`)
  console.log(`   Success: ${successCount}/${metadata.length}`)
  console.log(`   Errors: ${errorCount}`)
  
  await prisma.$disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
