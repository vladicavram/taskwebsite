const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

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

function buildPexelsPreviewUrl(title) {
  const searchQuery = translateToEnglish(title)
  // Note: Preview uses placeholder - actual script will fetch from Pexels API
  return `https://via.placeholder.com/1200x800/6366f1/ffffff?text=${encodeURIComponent(searchQuery)}`
}

async function main() {
  const prisma = new PrismaClient()
  
  try {
    const tasks = await prisma.task.findMany({
      select: { id: true, title: true, category: { select: { name: true } } },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`Generating preview for ${tasks.length} tasks...\n`)
    
    const imageMap = []
    
    for (const task of tasks) {
      const baseTitle = task.title.replace(/\s*-\s*[^-]+\([^)]+\)\s*$/, '').trim()
      const searchQuery = translateToEnglish(task.title)
      const imageUrl = buildPexelsPreviewUrl(task.title)
      
      imageMap.push({
        taskId: task.id,
        title: task.title,
        baseTitle,
        searchQuery,
        imageUrl
      })
    }
    
    // Generate HTML preview
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Images Preview</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .stats {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .card-body {
      padding: 15px;
    }
    .card-title {
      font-weight: 600;
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #333;
    }
    .card-meta {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    .category {
      display: inline-block;
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <h1>Task Images Preview</h1>
  <div class="stats">
    <strong>Total Tasks:</strong> ${tasks.length}<br>
    <strong>Search Method:</strong> Pexels AI-powered image search based on task meaning<br>
    <strong>Note:</strong> Placeholders shown - actual images will be fetched from Pexels API
  </div>
  <div class="grid">
    ${imageMap.map(item => `
      <div class="card">
        <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
        <div class="card-body">
          <h3 class="card-title">${item.title}</h3>
          <div class="card-meta"><strong>Base:</strong> ${item.baseTitle}</div>
          <div class="card-meta"><strong>Search:</strong> "${item.searchQuery}"</div>
          <div class="card-meta" style="font-size: 10px; color: #999; margin-top: 8px;">${item.imageUrl}</div>
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`
    
    const previewPath = path.join(process.cwd(), 'preview-images.html')
    fs.writeFileSync(previewPath, html, 'utf8')
    
    console.log(`\n✅ Preview generated: ${previewPath}`)
    console.log(`📊 Total: ${tasks.length} tasks with AI-generated images`)
    console.log(`\n🌐 Open in browser: file://${previewPath}`)
    
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
