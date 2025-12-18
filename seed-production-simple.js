const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Production Seed Script Starting...\n')
  
  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@taskwebsite.com' }
    })
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists, updating password...')
    }
    
    // Create/update admin
    const adminPassword = bcrypt.hashSync('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@taskwebsite.com' },
      update: {
        username: 'admin',
        password: adminPassword,
        isAdmin: true,
        canApply: true,
        userType: 'both',
        credits: 1000
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
    
    console.log('✅ Admin account configured:')
    console.log('   Email:', admin.email)
    console.log('   Username:', admin.username)
    console.log('   Password: admin123')
    console.log('   Is Admin:', admin.isAdmin)
    console.log('   User Type:', admin.userType)
    console.log('   Can Apply:', admin.canApply)
    
    // Check total users
    const userCount = await prisma.user.count()
    console.log(`\n📊 Total users in database: ${userCount}`)
    
    // Verify the password hash works
    const passwordMatch = bcrypt.compareSync('admin123', admin.password)
    console.log(`🔐 Password verification: ${passwordMatch ? '✅ PASS' : '❌ FAIL'}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
