const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSupportMessages() {
  try {
    // Find admin user
    const admin = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'admin' },
          { isAdmin: true }
        ]
      }
    })
    
    if (!admin) {
      console.log('❌ No admin user found!')
      return
    }
    
    console.log('✅ Admin user:', admin.email, '(ID:', admin.id + ')')
    
    // Check messages where admin is receiver
    const messages = await prisma.message.findMany({
      where: {
        receiverId: admin.id
      },
      include: {
        sender: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })
    
    console.log('\n📨 Messages to admin:', messages.length)
    messages.forEach(msg => {
      console.log(`  - From: ${msg.sender.email}`)
      console.log(`    Content: ${msg.content.substring(0, 100)}...`)
      console.log(`    Created: ${msg.createdAt}`)
      console.log(`    Read: ${msg.read}`)
      console.log()
    })
    
    // Check notifications for admin
    const notifications = await prisma.notification.findMany({
      where: {
        userId: admin.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })
    
    console.log('\n🔔 Notifications for admin:', notifications.length)
    notifications.forEach(notif => {
      console.log(`  - Type: ${notif.type}`)
      console.log(`    Content: ${notif.content}`)
      console.log(`    Created: ${notif.createdAt}`)
      console.log(`    Read: ${notif.read}`)
      console.log()
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSupportMessages()
