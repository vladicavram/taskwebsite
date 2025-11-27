const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function setAdmin() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('Usage: node set-admin.js <email>')
    process.exit(1)
  }
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true }
    })
    
    console.log(`✓ ${user.email} is now an admin`)
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

setAdmin()
