const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testConversationsAPI() {
  try {
    console.log('=== Testing Conversations API Logic ===\n')
    
    // Test with admin user
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
    
    console.log('✅ Testing with user:', admin.email)
    console.log('   ID:', admin.id)
    console.log()
    
    // Get applications (task conversations)
    const applications = await prisma.application.findMany({
      where: {
        status: 'accepted',
        OR: [
          { applicantId: admin.id },
          { task: { creatorId: admin.id } }
        ]
      },
      include: {
        task: {
          include: {
            creator: true
          }
        },
        applicant: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    console.log('📊 Task conversations (accepted applications):', applications.length)
    
    // Get direct messages
    const directMessages = await prisma.message.findMany({
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
    
    console.log('📨 Direct messages:', directMessages.length)
    
    // Group by conversation partner
    const directConversations = new Map()
    for (const msg of directMessages) {
      const partnerId = msg.senderId === admin.id ? msg.receiverId : msg.senderId
      if (!directConversations.has(partnerId)) {
        directConversations.set(partnerId, {
          partner: msg.senderId === admin.id ? msg.receiver : msg.sender,
          messages: [msg],
          lastMessage: msg
        })
      } else {
        directConversations.get(partnerId).messages.push(msg)
      }
    }
    
    console.log('💬 Unique direct conversations:', directConversations.size)
    console.log()
    
    // Simulate the API response
    console.log('=== Simulated API Response ===\n')
    
    const conversationsWithUnread = []
    
    for (const app of applications) {
      const unreadCount = await prisma.message.count({
        where: {
          applicationId: app.id,
          receiverId: admin.id,
          read: false
        }
      })
      
      const lastMessage = await prisma.message.findFirst({
        where: { applicationId: app.id },
        orderBy: { createdAt: 'desc' }
      })
      
      conversationsWithUnread.push({
        type: 'task',
        application: {
          id: app.id,
          task: { title: app.task.title },
          applicant: { email: app.applicant.email, name: app.applicant.name }
        },
        unreadCount,
        lastMessage
      })
    }
    
    for (const [partnerId, conv] of directConversations) {
      const unreadCount = await prisma.message.count({
        where: {
          applicationId: null,
          senderId: conv.partner.id,
          receiverId: admin.id,
          read: false
        }
      })
      
      conversationsWithUnread.push({
        type: 'direct',
        partner: {
          id: conv.partner.id,
          email: conv.partner.email,
          name: conv.partner.name
        },
        unreadCount,
        lastMessage: conv.lastMessage
      })
    }
    
    console.log('Total conversations:', conversationsWithUnread.length)
    console.log('  Task:', conversationsWithUnread.filter(c => c.type === 'task').length)
    console.log('  Direct:', conversationsWithUnread.filter(c => c.type === 'direct').length)
    console.log()
    
    if (conversationsWithUnread.length > 0) {
      console.log('Sample conversations:')
      conversationsWithUnread.slice(0, 3).forEach((c, i) => {
        console.log(`\n${i+1}. Type: ${c.type}`)
        if (c.type === 'task') {
          console.log(`   Task: ${c.application?.task?.title}`)
          console.log(`   Applicant: ${c.application?.applicant?.name || c.application?.applicant?.email}`)
        } else {
          console.log(`   Partner: ${c.partner?.name || c.partner?.email}`)
        }
        console.log(`   Unread: ${c.unreadCount}`)
        console.log(`   Last message: ${c.lastMessage ? 'Yes' : 'No'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testConversationsAPI()
