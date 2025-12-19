// Script to set canApply=false for all poster-only users
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixCanApply() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        userType: true,
        canApply: true,
        idPhotoUrl: true
      }
    })

    console.log(`Total users: ${users.length}`)

    // Set canApply to false for poster-only users without ID verification
    const postersWithoutID = users.filter(u => 
      u.userType === 'poster' && !u.idPhotoUrl
    )

    console.log(`\nPosters without ID (will set canApply=false): ${postersWithoutID.length}`)
    
    for (const user of postersWithoutID) {
      await prisma.user.update({
        where: { id: user.id },
        data: { canApply: false }
      })
      console.log(`  ✓ ${user.email}: canApply set to false`)
    }

    // Set canApply to true for taskers with ID verification
    const taskersWithID = users.filter(u => 
      (u.userType === 'tasker' || u.userType === 'both') && u.idPhotoUrl
    )

    console.log(`\nTaskers with ID (will set canApply=true): ${taskersWithID.length}`)
    
    for (const user of taskersWithID) {
      await prisma.user.update({
        where: { id: user.id },
        data: { canApply: true }
      })
      console.log(`  ✓ ${user.email}: canApply set to true`)
    }

    console.log('\n✅ Done!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCanApply()
