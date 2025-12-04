const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding production database...')
  
  const pw = bcrypt.hashSync('password123', 10)
  const adminPw = bcrypt.hashSync('admin123', 10)

  // Create categories
  const categories = [
    'Handyman', 'Cleaning', 'Moving', 'Gardening', 'Tech Support',
    'Tutoring', 'Pet Care', 'Delivery', 'Photography', 'Other'
  ]
  
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }
  console.log('✅ Categories created')

  // Create users
  const users = [
    {
      email: 'admin@taskwebsite.com',
      username: 'admin',
      name: 'Admin User',
      password: adminPw,
      isAdmin: true,
      role: 'admin',
      credits: 1000,
      bio: 'Platform administrator',
      location: 'Bucharest, Romania',
      skills: 'management, support',
      verified: true
    },
    {
      email: 'alice@example.com',
      username: 'alice',
      name: 'Alice Johnson',
      password: pw,
      credits: 50,
      bio: 'Experienced handyman and DIY enthusiast',
      location: 'Bucharest, Romania',
      skills: 'plumbing, painting, electrical',
      verified: true
    },
    {
      email: 'bob@example.com',
      username: 'bob',
      name: 'Bob Smith',
      password: pw,
      credits: 30,
      bio: 'Professional cleaner with 5 years experience',
      location: 'Cluj-Napoca, Romania',
      skills: 'cleaning, organizing, deep cleaning',
      verified: true
    },
    {
      email: 'carol@example.com',
      username: 'carol',
      name: 'Carol Williams',
      password: pw,
      credits: 25,
      bio: 'Tech enthusiast helping with computer issues',
      location: 'Timisoara, Romania',
      skills: 'tech support, networking, software',
      verified: false
    },
    {
      email: 'david@example.com',
      username: 'david',
      name: 'David Brown',
      password: pw,
      credits: 40,
      bio: 'Strong and reliable for moving tasks',
      location: 'Iasi, Romania',
      skills: 'moving, heavy lifting, packing',
      verified: true
    },
    {
      email: 'emma@example.com',
      username: 'emma',
      name: 'Emma Davis',
      password: pw,
      credits: 35,
      bio: 'Love gardening and landscaping',
      location: 'Constanta, Romania',
      skills: 'gardening, landscaping, plant care',
      verified: true
    },
    {
      email: 'frank@example.com',
      username: 'frank',
      name: 'Frank Miller',
      password: pw,
      credits: 20,
      bio: 'Math and science tutor for all ages',
      location: 'Brasov, Romania',
      skills: 'tutoring, math, science, english',
      verified: false
    },
    {
      email: 'grace@example.com',
      username: 'grace',
      name: 'Grace Wilson',
      password: pw,
      credits: 45,
      bio: 'Pet lover offering walking and sitting services',
      location: 'Bucharest, Romania',
      skills: 'pet care, dog walking, pet sitting',
      verified: true
    },
    {
      email: 'henry@example.com',
      username: 'henry',
      name: 'Henry Taylor',
      password: pw,
      credits: 15,
      bio: 'Fast and reliable delivery person',
      location: 'Sibiu, Romania',
      skills: 'delivery, driving, logistics',
      verified: true
    },
    {
      email: 'ivy@example.com',
      username: 'ivy',
      name: 'Ivy Anderson',
      password: pw,
      credits: 55,
      bio: 'Professional photographer for events and portraits',
      location: 'Oradea, Romania',
      skills: 'photography, editing, video',
      verified: true
    }
  ]

  for (const userData of users) {
    const { bio, location, skills, verified, ...userFields } = userData
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userFields
    })

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio,
        location,
        skills,
        verified
      }
    })
    
    console.log(`✅ Created user: ${userData.name} (${userData.email})`)
  }

  console.log('\n🎉 Seeding complete!')
  console.log('\n📋 Login credentials:')
  console.log('─'.repeat(50))
  console.log('Admin:    admin@taskwebsite.com / admin123')
  console.log('Users:    [any user email] / password123')
  console.log('─'.repeat(50))
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
