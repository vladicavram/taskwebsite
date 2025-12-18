// Update existing users to have proper userType values
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Updating existing users with userType...')
  
  // Get all users
  const users = await prisma.user.findMany({
    include: {
      profile: true
    }
  })
  
  console.log(`Found ${users.length} users`)
  
  for (const user of users) {
    // If user has a profile with skills and can apply, set as 'both'
    // Otherwise keep as 'poster'
    let userType = 'poster'
    
    if (user.profile && user.profile.skills && user.canApply) {
      userType = 'both'
      console.log(`Setting user ${user.username} to 'both' (has profile with skills and canApply)`)
    } else if (user.profile && user.profile.skills) {
      userType = 'tasker'
      console.log(`Setting user ${user.username} to 'tasker' (has profile with skills)`)
    } else {
      console.log(`Keeping user ${user.username} as 'poster'`)
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { userType }
    })
  }
  
  console.log('Done!')
  
  // Show summary
  const summary = await prisma.user.groupBy({
    by: ['userType'],
    _count: true
  })
  
  console.log('\nUser type summary:')
  summary.forEach(s => {
    console.log(`  ${s.userType}: ${s._count} users`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
