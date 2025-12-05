const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Simple base64 placeholder images
const avatarJohn = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzRhOWVmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPko8L3RleHQ+PC9zdmc+'
const avatarSarah = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y5NzMxNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlM8L3RleHQ+PC9zdmc+'
const avatarMike = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzEwYjk4MSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk08L3RleHQ+PC9zdmc+'

async function main() {
  const password = bcrypt.hashSync('test1234', 10)

  console.log('Creating users...')

  // User 1: John
  const john = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: { isAdmin: true, role: 'admin', canApply: true },
    create: {
      email: 'john@example.com',
      username: 'johndoe',
      name: 'John Doe',
      password: password,
      phone: '+1 (555) 123-4567',
      image: avatarJohn,
      isAdmin: true,
      role: 'admin',
      canApply: true
    }
  })

  await prisma.profile.upsert({
    where: { userId: john.id },
    update: {},
    create: {
      userId: john.id,
      bio: 'Professional handyman with 10 years experience. Specializing in home repairs and renovations.',
      location: 'New York, NY',
      skills: 'plumbing, electrical, carpentry, painting',
      verified: true
    }
  })

  // User 2: Sarah
  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      username: 'sarahsmith',
      name: 'Sarah Smith',
      password: password,
      phone: '+1 (555) 234-5678',
      image: avatarSarah
    }
  })

  await prisma.profile.upsert({
    where: { userId: sarah.id },
    update: {},
    create: {
      userId: sarah.id,
      bio: 'Expert cleaner and organizer. I help busy families keep their homes spotless and organized.',
      location: 'Los Angeles, CA',
      skills: 'cleaning, organizing, laundry, ironing',
      verified: true
    }
  })

  // User 3: Mike
  const mike = await prisma.user.upsert({
    where: { email: 'mike@example.com' },
    update: {},
    create: {
      email: 'mike@example.com',
      username: 'miketech',
      name: 'Mike Johnson',
      password: password,
      phone: '+1 (555) 345-6789',
      image: avatarMike
    }
  })

  await prisma.profile.upsert({
    where: { userId: mike.id },
    update: {},
    create: {
      userId: mike.id,
      bio: 'Computer technician and smart home specialist. I fix computers, install networks, and set up smart home systems.',
      location: 'San Francisco, CA',
      skills: 'computer repair, networking, smart home setup, tech support',
      verified: true
    }
  })

  console.log('✓ Created 3 users with profiles and avatars')
  console.log('\n=== LOGIN CREDENTIALS ===')
  console.log('Username: johndoe')
  console.log('Password: test1234')
  console.log('\nAlternatively:')
  console.log('Username: sarahsmith (or email: sarah@example.com)')
  console.log('Username: miketech (or email: mike@example.com)')
  console.log('All passwords: test1234')
  console.log('========================\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
