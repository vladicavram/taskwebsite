#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    // Find accepted applications with chargedCredits > 0
    const accepted = await prisma.application.findMany({ where: { status: 'accepted', chargedCredits: { gt: 0 } }, include: { applicant: true, task: true } })
    console.log('Accepted applications with chargedCredits > 0:', accepted.length)
    let missing = 0
    for (const a of accepted) {
      const spent = await prisma.creditTransaction.findFirst({ where: { userId: a.applicantId, relatedTaskId: a.taskId, type: 'spent' } })
      if (!spent) {
        missing++
        console.log('\nMISSING spent tx for app', a.id, 'task', a.taskId, 'title', a.task.title, 'applicant', a.applicant.email, 'chargedCredits', a.chargedCredits, 'selectedAt', a.selectedAt)
        const notifs = await prisma.notification.findMany({ where: { applicationId: a.id }, orderBy: { createdAt: 'asc' } })
        console.log('  Notifications for this application:', notifs)
      }
    }
    console.log('\nTotal missing spent txs:', missing)
  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
})().catch((e) => { console.error(e); process.exit(1) })
