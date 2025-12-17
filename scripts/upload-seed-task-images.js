const { PrismaClient } = require('@prisma/client')
const { put } = require('@vercel/blob')

// Reuse the validated Unsplash URLs already used in seed
const taskImages = [
  'https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80&sat=-5',
  'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sat=-5',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80&sat=-5',
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80&sat=-5',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80&sat=-5',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80&sat=-5',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sat=-5',
  'https://images.unsplash.com/photo-1465805139202-a644e217f00e?auto=format&fit=crop&w=1200&q=80&sat=-5',
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80&sat=-5'
]

const titleImages = {
  'Curatenie generala in apartament': ['https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Генеральная уборка квартиры': ['https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Montaj dulap si reglaj usi': ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Сборка шкафа и регулировка дверей': ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Vopsire pereti living': ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Покраска стен в гостиной': ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Instalare masina de spalat': ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Подключение стиральной машины': ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Reparatie priza si verificare tablou': ['https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Ремонт розетки и проверка щитка': ['https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Transport canapea': ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Перевозка дивана': ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Gradinarit: tuns iarba si gard viu': ['https://images.unsplash.com/photo-1465805139202-a644e217f00e?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Садовые работы: газон и изгородь': ['https://images.unsplash.com/photo-1465805139202-a644e217f00e?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Curatare dupa renovare': ['https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Уборка после ремонта': ['https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Depanare internet si Wi-Fi': ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Настройка интернета и Wi-Fi': ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Asamblare pat si noptiere': ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Сборка кровати и тумбочек': ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Mutare birou mic': ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Офисный переезд': ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Lectii de romana pentru copil': ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Уроки румынского для школьника': ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Eveniment: fotograf la botez': ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Фотограф на семейное событие': ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Schimbat baterie chiuveta si etansare': ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Замена смесителя и герметизация': ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Montaj corpuri de iluminat': ['https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Монтаж светильников': ['https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Curatare canapele si covoare': ['https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Химчистка дивана и ковров': ['https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Corectie gresie desprinsa in baie': ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Исправить отклеившуюся плитку в ванной': ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Instalare sistem video interfon': ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Монтаж домофона на 3 квартиры': ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Livrare cumparaturi senior': ['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Доставка покупок пожилому человеку': ['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Reparat usa de interior care agata': ['https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80&sat=-5'],
  'Починить межкомнатную дверь': ['https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80&sat=-5']
}

const categoryImages = {
  Curatenie: [
    'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1582719478248-4a00f3f77fe6?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1581579186890-45585b3c38fe?auto=format&fit=crop&w=1200&q=80&sat=-5'
  ],
  'Reparatii electrice': [
    'https://images.unsplash.com/photo-1503389152951-9f343605f61e?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80&sat=-5'
  ],
  'Instalatii sanitare': [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1589578527966-0d484df2769b?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1200&q=80&sat=-5'
  ],
  'IT si retele': [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80&sat=-5'
  ],
  'Mutari si transport': [
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1542452255191-c85d3a1e0b7b?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1529429617124-aee7d6a5c12d?auto=format&fit=crop&w=1200&q=80&sat=-5'
  ],
  'Pictura si zugraveli': [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1501453675342-41c0f7bd0cbb?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1473181488821-2d23949a045a?auto=format&fit=crop&w=1200&q=80&sat=-5'
  ],
  'Montaj mobilier': [
    'https://images.unsplash.com/photo-1505693415763-3ed5e04ba4cd?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80&sat=-5'
  ],
  Gradinarit: [
    'https://images.unsplash.com/photo-1465805139202-a644e217f00e?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80&sat=-5'
  ],
  Evenimente: [
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1200&q=80&sat=-5'
  ],
  'Lectii si meditatii': [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80&sat=-5'
  ],
  'Livrari locale': [
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1601050690597-df62cfe512c9?auto=format&fit=crop&w=1200&q=80&sat=-5'
  ],
  'Design interior': [
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80&sat=-5',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80&sat=-5'
  ]
}

function pick(arr, i) {
  return arr[i % arr.length]
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Missing BLOB_READ_WRITE_TOKEN. Set it in env before running this script.')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    const tasks = await prisma.task.findMany({ select: { id: true, title: true, category: { select: { name: true } } } })
    console.log(`Uploading images for ${tasks.length} tasks...`)

    let uploaded = 0
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      const catName = task.category?.name || null
      const baseTitle = task.title.split(' - ')[0].trim()
      const pool = titleImages[baseTitle]
        || (catName && categoryImages[catName])
        || taskImages
      const src = pick(pool, i)
      const res = await fetch(src)
      if (!res.ok) {
        throw new Error(`Failed to fetch ${src}: ${res.status}`)
      }
      const arrayBuffer = await res.arrayBuffer()

      const blob = await put(`tasks/${task.id}/seed.jpg`, Buffer.from(arrayBuffer), {
        access: 'public',
        addRandomSuffix: true
      })

      await prisma.task.update({
        where: { id: task.id },
        data: { imageUrl: blob.url }
      })

      uploaded++
      if (uploaded % 20 === 0) {
        console.log(`Uploaded ${uploaded}/${tasks.length}`)
      }
    }

    console.log(`Done. Uploaded images for ${uploaded} tasks.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
