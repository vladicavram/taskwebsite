const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  const users = await prisma.user.findMany()
  console.log('Users in database:')
  users.forEach(u => {
    console.log(`  - Username: ${u.username || 'NO_USERNAME'} / Email: ${u.email} / Has password: ${!!u.password}`)
  })
  await prisma.$disconnect()
}

checkUsers()
