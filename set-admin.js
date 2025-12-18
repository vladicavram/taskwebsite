const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const adminPassword = bcrypt.hashSync('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskwebsite.com' },
    update: {
      username: 'admin',
      password: adminPassword,
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
  
  console.log('✅ Admin account set:')
  console.log('   Email: admin@taskwebsite.com')
  console.log('   Username: admin')
  console.log('   Password: admin123')
  console.log('   Is Admin:', admin.isAdmin)
}

main().catch(console.error).finally(() => prisma.$disconnect())
