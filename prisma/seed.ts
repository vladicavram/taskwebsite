import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const pw = bcrypt.hashSync('password123', 10)

  const cat1 = await prisma.category.upsert({
    where: { name: 'Handyman' },
    update: {},
    create: { name: 'Handyman' }
  })

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      password: pw,
      image: null
    }
  })

  await prisma.profile.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      bio: 'Helpful neighbor and handyman',
      location: 'Bucharest, Romania',
      skills: 'plumbing, painting',
      verified: true
    }
  })

  await prisma.task.create({
    data: {
      title: 'Fix kitchen sink',
      description: 'Leaky sink needs a quick fix',
      price: 40,
      location: 'Bucharest',
      creatorId: user1.id,
      categoryId: cat1.id
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
