const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function test() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@taskwebsite.com' }
  })
  
  if (!admin) {
    console.log('Admin user NOT FOUND in database')
    return
  }
  
  console.log('Admin found:')
  console.log('  Email:', admin.email)
  console.log('  Username:', admin.username)
  console.log('  Name:', admin.name)
  console.log('  IsAdmin:', admin.isAdmin)
  console.log('  Has password:', !!admin.password)
  
  const testPassword = 'admin123'
  const matches = bcrypt.compareSync(testPassword, admin.password)
  console.log('\nPassword test result:', matches ? 'MATCHES' : 'DOES NOT MATCH')
}

test().catch(console.error).finally(() => prisma.$disconnect())
