const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verify() {
  try {
    console.log('=== Verifying Admin Can See Notifications ===\n')
    
    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@taskwebsite.com' }
    })
    
    if (!admin) {
      console.log('❌ Admin not found')
      return
    }
    
    console.log('✅ Admin user:', admin.email)
    console.log('   ID:', admin.id)
    console.log('   isAdmin:', admin.isAdmin)
    console.log('   role:', admin.role)
    console.log()
    
    // Get notifications for this admin
    const notifications = await prisma.notification.findMany({
      where: { userId: admin.id },
      include: {
        application: {
          include: {
            applicant: true,
            task: {
              include: {
                creator: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    
    console.log('📊 Total notifications for admin:', notifications.length)
    console.log('   Unread:', notifications.filter(n => !n.read).length)
    console.log('   Read:', notifications.filter(n => n.read).length)
    console.log()
    
    if (notifications.length > 0) {
      console.log('=== Recent Notifications ===\n')
      notifications.slice(0, 10).forEach((n, i) => {
        console.log(`${i+1}. Type: ${n.type}`)
        console.log(`   Content: ${n.content}`)
        console.log(`   Read: ${n.read}`)
        console.log(`   ApplicationId: ${n.applicationId || 'NULL (direct message)'}`)
        console.log(`   Created: ${n.createdAt}`)
        console.log()
      })
    } else {
      console.log('⚠️  No notifications found for admin!')
      console.log()
      console.log('Let me check john@example.com instead...')
      
      const john = await prisma.user.findUnique({
        where: { email: 'john@example.com' }
      })
      
      if (john) {
        const johnNotifs = await prisma.notification.findMany({
          where: { userId: john.id },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
        
        console.log('\n📊 Notifications for john@example.com:', johnNotifs.length)
        console.log('   Unread:', johnNotifs.filter(n => !n.read).length)
        
        if (johnNotifs.length > 0) {
          console.log('\n=== john@example.com notifications ===\n')
          johnNotifs.forEach((n, i) => {
            console.log(`${i+1}. Type: ${n.type}`)
            console.log(`   Content: ${n.content}`)
            console.log(`   Read: ${n.read}`)
            console.log()
          })
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verify()
