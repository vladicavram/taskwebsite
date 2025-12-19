const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testAdminNotifications() {
  try {
    console.log('=== TESTING ADMIN NOTIFICATIONS SYSTEM ===\n')
    
    // Find admin
    const admin = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'admin' },
          { isAdmin: true }
        ]
      }
    })
    
    if (!admin) {
      console.log('❌ No admin found')
      return
    }
    
    console.log('✅ Admin found:', admin.email)
    console.log('   Admin ID:', admin.id)
    console.log()
    
    // Check unread notifications
    const unreadNotifications = await prisma.notification.findMany({
      where: {
        userId: admin.id,
        read: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('🔔 Unread Notifications:', unreadNotifications.length)
    unreadNotifications.forEach((notif, idx) => {
      console.log(`\n${idx + 1}. Type: ${notif.type}`)
      console.log(`   Content: ${notif.content}`)
      console.log(`   Created: ${notif.createdAt}`)
    })
    
    // Check unread messages
    const unreadMessages = await prisma.message.findMany({
      where: {
        receiverId: admin.id,
        read: false
      },
      include: {
        sender: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('\n\n📨 Unread Messages:', unreadMessages.length)
    unreadMessages.forEach((msg, idx) => {
      console.log(`\n${idx + 1}. From: ${msg.sender.name || msg.sender.email}`)
      console.log(`   Preview: ${msg.content.substring(0, 80)}...`)
      console.log(`   Created: ${msg.createdAt}`)
    })
    
    // Check direct message conversations
    const directConversations = await prisma.message.findMany({
      where: {
        applicationId: null,
        OR: [
          { senderId: admin.id },
          { receiverId: admin.id }
        ]
      },
      include: {
        sender: true,
        receiver: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('\n\n💬 Direct Message Conversations:', directConversations.length, 'messages')
    
    // Group by conversation partner
    const partners = new Set()
    directConversations.forEach(msg => {
      const partnerId = msg.senderId === admin.id ? msg.receiverId : msg.senderId
      partners.add(partnerId)
    })
    
    console.log('   Unique conversation partners:', partners.size)
    
    console.log('\n\n=== SUMMARY ===')
    console.log(`✅ Admin has ${unreadNotifications.length} unread notifications`)
    console.log(`✅ Admin has ${unreadMessages.length} unread messages`)
    console.log(`✅ Admin has ${partners.size} direct conversation(s)`)
    console.log('\n📍 When admin logs in:')
    console.log('   1. Notification bell should show:', unreadNotifications.length)
    console.log('   2. Messages page should show:', partners.size, 'conversation(s)')
    console.log('   3. Clicking notification redirects to /messages')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminNotifications()
