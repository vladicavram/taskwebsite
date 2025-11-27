const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function testLogin() {
  const testUsername = 'johndoe'
  const testPassword = 'test1234'
  
  console.log(`Testing login with username: ${testUsername}`)
  
  // Find user by username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: testUsername },
        { username: testUsername }
      ]
    }
  })
  
  if (!user) {
    console.log('❌ User not found')
    await prisma.$disconnect()
    return
  }
  
  console.log(`✓ User found: ${user.name} (${user.email})`)
  console.log(`  Username: ${user.username}`)
  console.log(`  Has password: ${!!user.password}`)
  
  if (!user.password) {
    console.log('❌ User has no password set')
    await prisma.$disconnect()
    return
  }
  
  // Test password
  const passwordMatch = bcrypt.compareSync(testPassword, user.password)
  console.log(`  Password match: ${passwordMatch}`)
  
  if (passwordMatch) {
    console.log('✅ Login would succeed!')
  } else {
    console.log('❌ Password does not match')
    console.log('   First 20 chars of hash:', user.password.substring(0, 20))
  }
  
  await prisma.$disconnect()
}

testLogin()
