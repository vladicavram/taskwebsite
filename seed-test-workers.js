// Seed test workers for development
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  console.log('Creating test workers...')
  
  const workers = [
    {
      username: 'john_plumber',
      name: 'John Smith',
      email: 'john@example.com',
      userType: 'tasker',
      bio: 'Professional plumber with 10+ years of experience. Licensed and insured.',
      skills: 'Plumbing, Pipe Repair, Bathroom Installation',
      location: 'Chișinău'
    },
    {
      username: 'maria_cleaner',
      name: 'Maria Ionescu',
      email: 'maria@example.com',
      userType: 'both',
      bio: 'Experienced cleaner specializing in home and office cleaning. Eco-friendly products.',
      skills: 'House Cleaning, Office Cleaning, Deep Cleaning',
      location: 'Bălți'
    },
    {
      username: 'alex_handyman',
      name: 'Alex Popescu',
      email: 'alex@example.com',
      userType: 'tasker',
      bio: 'Skilled handyman for furniture assembly, repairs, and general maintenance.',
      skills: 'Furniture Assembly, Home Repairs, Painting, Electrical',
      location: 'Chișinău'
    }
  ]
  
  const password = bcrypt.hashSync('password123', 10)
  
  for (const worker of workers) {
    const user = await prisma.user.create({
      data: {
        username: worker.username,
        name: worker.name,
        email: worker.email,
        password,
        userType: worker.userType,
        canApply: true, // Pre-approved for testing
        profile: {
          create: {
            bio: worker.bio,
            skills: worker.skills,
            location: worker.location,
            verified: true
          }
        }
      }
    })
    
    console.log(`✓ Created worker: ${worker.username}`)
  }
  
  console.log('\nDone! Test workers created with:')
  console.log('  Email: john@example.com, maria@example.com, alex@example.com')
  console.log('  Password: password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
