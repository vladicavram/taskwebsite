const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking production admin account...\n')
  
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@taskwebsite.com' }
  })
  
  if (!admin) {
    console.log('❌ Admin user NOT found in database!')
    const userCount = await prisma.user.count()
    console.log(`📊 Total users: ${userCount}`)
    
    const allUsers = await prisma.user.findMany({
      select: { email: true, username: true, name: true, isAdmin: true }
    })
    console.log('\n👥 All users in database:')
    allUsers.forEach(u => console.log(`  - ${u.email} (${u.username}) - Admin: ${u.isAdmin}`))
    return
  }
  
  console.log('✅ Admin found:')
  console.log('   Email:', admin.email)
  console.log('   Username:', admin.username)
  console.log('   Name:', admin.name)
  console.log('   Is Admin:', admin.isAdmin)
  console.log('   User Type:', admin.userType)
  console.log('   Can Apply:', admin.canApply)
  console.log('   Blocked:', admin.blocked)
  console.log('   Has Password:', !!admin.password)
  
  if (admin.password) {
    const testPasswords = ['admin123', 'password123', 'admin']
    console.log('\n🔐 Testing passwords:')
    for (const pwd of testPasswords) {
      const match = bcrypt.compareSync(pwd, admin.password)
      console.log(`   "${pwd}": ${match ? '✅ MATCH' : '❌ no match'}`)
    }
  }
  
  const userCount = await prisma.user.count()
  const taskCount = await prisma.task.count()
  console.log(`\n📊 Database stats:`)
  console.log(`   Users: ${userCount}`)
  console.log(`   Tasks: ${taskCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
