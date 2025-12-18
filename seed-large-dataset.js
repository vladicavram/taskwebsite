const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

const MOLDOVA_CITIES = ['Chișinău', 'Bălți', 'Tiraspol', 'Bender', 'Rîbnița']
const FIRST_NAMES = ['Ion', 'Maria', 'Vasile', 'Elena', 'Alexandru', 'Ana', 'Dumitru', 'Tatiana', 'Andrei', 'Natalia']
const LAST_NAMES = ['Popescu', 'Ionescu', 'Moldovan', 'Rusu', 'Popa', 'Stan', 'Dumitrescu', 'Nicolae', 'Gheorghe', 'Marin']
const SKILLS = [
  'Plumbing, Pipe Repair, Bathroom Installation',
  'House Cleaning, Office Cleaning, Deep Cleaning',
  'Furniture Assembly, Home Repairs, Painting',
  'Gardening, Lawn Care, Landscaping',
  'Electrical Work, Wiring, Lighting Installation',
  'Moving Services, Packing, Heavy Lifting',
  'Carpentry, Woodwork, Custom Furniture',
  'HVAC Repair, Air Conditioning, Heating',
  'Painting, Interior Design, Wall Decoration',
  'Computer Repair, Tech Support, Software Installation'
]

async function main() {
  console.log('🌱 Generating 100 workers and 200 tasks...\n')
  
  const password = bcrypt.hashSync('password123', 10)
  const adminPassword = bcrypt.hashSync('admin123', 10)
  
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskwebsite.com' },
    update: {
      isAdmin: true,
      canApply: true,
      userType: 'both'
    },
    create: {
      email: 'admin@taskwebsite.com',
      username: 'admin',
      name: 'Admin User',
      password: adminPassword,
      isAdmin: true,
      canApply: true,
      userType: 'both',
      credits: 1000
    }
  })
  console.log('✅ Admin user created')
  
  // Create 100 workers
  const workers = []
  for (let i = 0; i < 100; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`
    const email = `${username}@example.com`
    const skills = SKILLS[Math.floor(Math.random() * SKILLS.length)]
    const location = MOLDOVA_CITIES[Math.floor(Math.random() * MOLDOVA_CITIES.length)]
    
    const worker = await prisma.user.create({
      data: {
        email,
        username,
        name: `${firstName} ${lastName}`,
        password,
        canApply: true,
        userType: i % 3 === 0 ? 'tasker' : 'both', // Mix of tasker and both
        credits: 10,
        profile: {
          create: {
            bio: `Professional ${skills.split(',')[0].toLowerCase()} with years of experience.`,
            location,
            skills,
            verified: true
          }
        }
      }
    })
    
    workers.push(worker)
    
    if ((i + 1) % 10 === 0) {
      console.log(`Created ${i + 1}/100 workers...`)
    }
  }
  
  console.log('✅ 100 workers created\n')
  
  // Get categories
  const categories = await prisma.category.findMany()
  if (categories.length === 0) {
    console.log('Creating categories...')
    const categoryNames = ['Handyman', 'Cleaning', 'Moving', 'Gardening', 'Tech Support', 'Tutoring', 'Pet Care', 'Delivery', 'Photography', 'Other']
    for (const name of categoryNames) {
      await prisma.category.create({ data: { name } })
    }
  }
  const allCategories = await prisma.category.findMany()
  
  // Create 200 tasks
  const taskTitles = [
    'Need help moving furniture',
    'Deep cleaning needed',
    'Fix leaking pipe',
    'Install ceiling fan',
    'Paint living room',
    'Assemble IKEA furniture',
    'Garden maintenance',
    'Computer virus removal',
    'Dog walking services',
    'Photography for event'
  ]
  
  for (let i = 0; i < 200; i++) {
    const creator = i < 100 ? workers[i] : workers[Math.floor(Math.random() * workers.length)]
    const title = taskTitles[Math.floor(Math.random() * taskTitles.length)]
    const category = allCategories[Math.floor(Math.random() * allCategories.length)]
    const location = MOLDOVA_CITIES[Math.floor(Math.random() * MOLDOVA_CITIES.length)]
    const price = (Math.floor(Math.random() * 20) + 5) * 10 // 50-250 MDL
    
    // Determine task state
    const isCompleted = i % 5 === 0
    const isInProgress = i % 4 === 0 && !isCompleted
    
    await prisma.task.create({
      data: {
        title: `${title} #${i + 1}`,
        description: `Looking for professional help with this task in ${location}. Please contact if you have relevant experience.`,
        price,
        location,
        creatorId: creator.id,
        categoryId: category.id,
        isOpen: !isCompleted,
        completedAt: isCompleted ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null
      }
    })
    
    if ((i + 1) % 20 === 0) {
      console.log(`Created ${i + 1}/200 tasks...`)
    }
  }
  
  console.log('✅ 200 tasks created\n')
  
  console.log('🎉 Done!\n')
  console.log('Login credentials:')
  console.log('  Admin: admin@taskwebsite.com / admin123')
  console.log('  Workers: any email / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
