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
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1200&q=80&sat=-5',
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80&sat=-5'
]

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Missing BLOB_READ_WRITE_TOKEN. Set it in env before running this script.')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    const tasks = await prisma.task.findMany({ select: { id: true, title: true } })
    console.log(`Uploading images for ${tasks.length} tasks...`)

    let uploaded = 0
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      const src = taskImages[i % taskImages.length]
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
