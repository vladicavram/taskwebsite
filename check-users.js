const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const userCount = await prisma.user.count()
  const taskCount = await prisma.task.count()
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@taskwebsite.com' },
    select: { username: true, email: true, isAdmin: true, canApply: true, userType: true }
  })
  
  const workers = await prisma.user.count({
    where: { canApply: true, userType: { in: ['tasker', 'both'] } }
  })
  
  console.log('Database Summary:')
  console.log('================')
  console.log(`Total Users: ${userCount}`)
  console.log(`Total Tasks: ${taskCount}`)
  console.log(`Workers (tasker/both + canApply): ${workers}`)
  console.log('\nAdmin Account:')
  console.log(admin)
  console.log('\n✅ Everything is ready!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
