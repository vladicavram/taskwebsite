const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Update all users with profiles to be 'both' type
  const usersWithProfiles = await prisma.user.findMany({
    where: {
      profile: { isNot: null }
    }
  })
  
  for (const user of usersWithProfiles) {
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        userType: user.canApply ? 'both' : 'poster'
      }
    })
  }
  
  console.log(`Updated ${usersWithProfiles.length} users with userType`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
