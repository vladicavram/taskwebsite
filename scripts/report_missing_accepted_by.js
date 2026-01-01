#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    // Use raw query to avoid relying on prisma Client-side model changes that
    // may not yet be applied to the database (acceptedBy column might be missing).
    const apps = await prisma.$queryRaw`
      SELECT id, "taskId", "applicantId", "selectedAt", "chargedCredits", "proposedPrice"
      FROM "Application"
      WHERE status = 'accepted'
    `
    console.log('Accepted applications in DB:', apps.length)
    for (const a of apps) {
      const task = await prisma.task.findUnique({ where: { id: a.taskId } })
      const applicant = await prisma.user.findUnique({ where: { id: a.applicantId } })
      console.log('\nApp', a.id, 'task', a.taskId, 'title', task?.title, 'applicant', applicant?.email, 'selectedAt', a.selectedAt, 'chargedCredits', a.chargedCredits)
      const notifs = await prisma.notification.findMany({ where: { applicationId: a.id }, orderBy: { createdAt: 'asc' } })
      console.log(' Notifications for this application:', notifs)
      // Heuristic: if there is an application_accepted notification within 5 seconds of selectedAt, the accepter is likely the task.creatorId
      let proposedAccepter = null
      if (a.selectedAt) {
        const windowStart = new Date(new Date(a.selectedAt).getTime() - 5000)
        const windowEnd = new Date(new Date(a.selectedAt).getTime() + 5000)
        const acceptNotif = notifs.find(n => n.type === 'application_accepted' && new Date(n.createdAt) >= windowStart && new Date(n.createdAt) <= windowEnd)
        if (acceptNotif) {
          proposedAccepter = (await prisma.task.findUnique({ where: { id: a.taskId }, include: { creator: true } })).creatorId
        }
      }
      console.log(' Proposed accepter (heuristic):', proposedAccepter || 'unknown')
    }
  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
})().catch((e) => { console.error(e); process.exit(1) })
