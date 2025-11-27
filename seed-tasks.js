const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Creating test tasks...')

  // Get all users
  const users = await prisma.user.findMany()
  if (users.length === 0) {
    console.error('No users found. Run seed-users.js first.')
    return
  }

  const john = users.find(u => u.username === 'johndoe')
  const sarah = users.find(u => u.username === 'sarahsmith')
  const mike = users.find(u => u.username === 'miketech')

  const tasks = [
    {
      title: 'Need help moving furniture',
      description: 'Looking for someone to help move a couch and dining table from my apartment to a new place across town. Should take about 2-3 hours.',
      price: 75.00,
      location: 'New York, NY',
      creatorId: john?.id || users[0].id
    },
    {
      title: 'Deep cleaning needed for 3-bedroom house',
      description: 'Need thorough cleaning including bathrooms, kitchen, bedrooms, and living areas. Must bring own cleaning supplies.',
      price: 150.00,
      location: 'Los Angeles, CA',
      creatorId: sarah?.id || users[1].id
    },
    {
      title: 'Computer repair - laptop not starting',
      description: 'My laptop won\'t turn on. Need someone to diagnose and fix the issue. It\'s a Dell XPS 15.',
      price: 80.00,
      location: 'San Francisco, CA',
      creatorId: mike?.id || users[2].id
    },
    {
      title: 'Paint living room walls',
      description: 'Need someone experienced to paint my living room. Walls are already prepped. Paint is provided.',
      price: 200.00,
      location: 'New York, NY',
      creatorId: john?.id || users[0].id
    },
    {
      title: 'Help with yard work',
      description: 'Need help mowing lawn, trimming hedges, and general yard cleanup. About 4 hours of work.',
      price: 100.00,
      location: 'Los Angeles, CA',
      creatorId: sarah?.id || users[1].id
    }
  ]

  for (const task of tasks) {
    await prisma.task.create({ data: task })
  }

  console.log(`✓ Created ${tasks.length} test tasks`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
