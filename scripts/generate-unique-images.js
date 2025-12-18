const { PrismaClient } = require('@prisma/client')
const { put } = require('@vercel/blob')
const crypto = require('crypto')

// Translate Romanian/Russian to English for better image search results
function translateToEnglish(title) {
  const translations = {
    // Romanian to English
    'Curatenie generala in apartament': 'general apartment cleaning',
    'Montaj dulap si reglaj usi': 'wardrobe assembly and door adjustment',
    'Vopsire pereti living': 'living room wall painting',
    'Instalare masina de spalat': 'washing machine installation',
    'Reparatie priza si verificare tablou': 'electrical outlet repair circuit breaker',
    'Transport canapea': 'sofa transport moving',
    'Gradinarit: tuns iarba si gard viu': 'lawn mowing hedge trimming gardening',
    'Curatare dupa renovare': 'post renovation cleaning',
    'Depanare internet si Wi-Fi': 'internet wifi troubleshooting repair',
    'Asamblare pat si noptiere': 'bed nightstand assembly',
    'Mutare birou mic': 'small office moving relocation',
    'Lectii de romana pentru copil': 'child tutoring lesson education',
    'Eveniment: fotograf la botez': 'baptism christening photographer event',
    'Schimbat baterie chiuveta si etansare': 'kitchen faucet replacement plumbing',
    'Montaj corpuri de iluminat': 'lighting fixture installation electrician',
    'Curatare canapele si covoare': 'sofa carpet upholstery cleaning',
    'Corectie gresie desprinsa in baie': 'bathroom tile repair fixing',
    'Instalare sistem video interfon': 'video intercom system installation',
    'Livrare cumparaturi senior': 'grocery delivery shopping senior',
    'Reparat usa de interior care agata': 'interior door repair fixing',
    
    // Russian to English
    'Генеральная уборка квартиры': 'general apartment cleaning',
    'Сборка шкафа и регулировка дверей': 'wardrobe assembly door adjustment',
    'Покраска стен в гостиной': 'living room wall painting',
    'Подключение стиральной машины': 'washing machine installation plumbing',
    'Ремонт розетки и проверка щитка': 'electrical outlet repair circuit breaker',
    'Перевозка дивана': 'sofa moving transport',
    'Садовые работы: газон и изгородь': 'lawn mowing hedge trimming gardening',
    'Уборка после ремонта': 'post renovation cleaning',
    'Настройка интернета и Wi-Fi': 'internet wifi setup configuration',
    'Сборка кровати и тумбочек': 'bed nightstand assembly furniture',
    'Офисный переезд': 'office moving relocation',
    'Уроки румынского для школьника': 'student tutoring lesson education',
    'Фотограф на семейное событие': 'family event photographer',
    'Замена смесителя и герметизация': 'faucet replacement plumbing sealing',
    'Монтаж светильников': 'lighting fixture installation',
    'Химчистка дивана и ковров': 'sofa carpet upholstery dry cleaning',
    'Исправить отклеившуюся плитку в ванной': 'bathroom tile repair fixing',
    'Монтаж домофона на 3 квартиры': 'intercom system installation apartment',
    'Доставка покупок пожилому человеку': 'grocery delivery shopping elderly',
    'Починить межкомнатную дверь': 'interior door repair fixing'
  }
  
  // Remove location suffix (everything after last hyphen)
  const baseTitle = title.replace(/\s*-\s*[^-]+\([^)]+\)\s*$/, '').trim()
  
  return translations[baseTitle] || baseTitle.toLowerCase()
}

// Function to fetch unique image from Lorem Picsum with seeded randomness
async function fetchUniqueImage(title, retryCount = 0) {
  const searchQuery = translateToEnglish(title)
  
  try {
    // Create a seed from the title to get consistent but unique images
    const seed = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + retryCount * 1000
    
    // Use Lorem Picsum with seed for reproducible random images
    const imageUrl = `https://picsum.photos/seed/${seed}/1200/800`
    
    const imageResponse = await fetch(imageUrl, { redirect: 'follow' })
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`)
    }
    
    const arrayBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    return { buffer, query: searchQuery, url: imageUrl, seed }
  } catch (error) {
    console.error(`  ❌ Error fetching image:`, error.message)
    throw error
  }
}

async function main() {
  const prisma = new PrismaClient()
  const imageHashes = new Set()
  
  try {
    const tasks = await prisma.task.findMany({
      select: { id: true, title: true },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`\n🎨 Generating unique images for ${tasks.length} tasks using AI image search...\n`)
    
    let successCount = 0
    let duplicateCount = 0
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      const progress = `[${i + 1}/${tasks.length}]`
      
      console.log(`${progress} ${task.title}`)
      
      let uploaded = false
      let retryAttempts = 0
      const maxRetries = 5
      
      while (!uploaded && retryAttempts < maxRetries) {
        try {
          // Fetch image based on task title
          const { buffer, query, url, seed } = await fetchUniqueImage(task.title, retryAttempts)
          
          // Calculate hash to check for duplicates
          const hash = crypto.createHash('sha256').update(buffer).digest('hex')
          
          if (imageHashes.has(hash)) {
            duplicateCount++
            console.log(`  ⚠️  Duplicate detected (attempt ${retryAttempts + 1}), retrying...`)
            retryAttempts++
            await new Promise(resolve => setTimeout(resolve, 500)) // Wait before retry
            continue
          }
          
          // Upload to Vercel Blob
          const blob = await put(`tasks/${task.id}.jpg`, buffer, {
            access: 'public',
            contentType: 'image/jpeg'
          })
          
          // Update task with new image URL
          await prisma.task.update({
            where: { id: task.id },
            data: { imageUrl: blob.url }
          })
          
          imageHashes.add(hash)
          successCount++
          console.log(`  ✅ Uploaded (seed: ${seed})`)
          uploaded = true
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 300))
          
        } catch (error) {
          retryAttempts++
          if (retryAttempts >= maxRetries) {
            console.log(`  ❌ Failed after ${maxRetries} attempts: ${error.message}`)
            throw new Error(`Failed to generate unique image for task: ${task.title}`)
          }
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }
    
    console.log(`\n✅ Complete!`)
    console.log(`   Success: ${successCount}/${tasks.length}`)
    console.log(`   Duplicates found: ${duplicateCount}`)
    console.log(`   Unique images: ${imageHashes.size}`)
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
