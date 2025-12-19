const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    // Find all admins
    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { isAdmin: true },
          { email: { contains: 'admin' } }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isAdmin: true
      }
    })
    
    console.log('=== ADMIN USERS ===')
    console.log('Found', admins.length, 'admin user(s):\n')
    
    admins.forEach((admin, idx) => {
      console.log(`${idx + 1}. Email: ${admin.email}`)
      console.log(`   Name: ${admin.name || 'N/A'}`)
      console.log(`   ID: ${admin.id}`)
      console.log(`   role: ${admin.role || 'N/A'}`)
      console.log(`   isAdmin: ${admin.isAdmin}`)
      console.log()
    })
    
    // Check if john@example.com exists
    const john = await prisma.user.findUnique({
      where: { email: 'john@example.com' }
    })
    
    if (john) {
      console.log('✅ john@example.com exists')
      console.log('   isAdmin:', john.isAdmin)
      console.log('   role:', john.role)
    } else {
      console.log('❌ john@example.com does NOT exist in production')
    }
    
    // Check admin@taskwebsite.com
    const adminTask = await prisma.user.findUnique({
      where: { email: 'admin@taskwebsite.com' }
    })
    
    if (adminTask) {
      console.log('\n✅ admin@taskwebsite.com exists')
      console.log('   isAdmin:', adminTask.isAdmin)
      console.log('   role:', adminTask.role)
    } else {
      console.log('\n❌ admin@taskwebsite.com does NOT exist in production')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
