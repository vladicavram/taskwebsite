#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    const app = await prisma.application.findUnique({ where: { id: 'cmjt8eknj0009dt51rgarp5sf' }, include: { task: true, applicant: true } })
    console.log('App:', app.id, 'status', app.status, 'proposedPrice', app.proposedPrice, 'chargedCredits', app.chargedCredits, 'lastProposedBy', app.lastProposedBy, 'selectedAt', app.selectedAt)
    const proposer = await prisma.user.findUnique({ where: { id: app.lastProposedBy } })
    const creator = await prisma.user.findUnique({ where: { id: app.task.creatorId } })
    console.log('Proposer:', proposer?.email, proposer?.id)
    console.log('Creator:', creator?.email, creator?.id)

    const notif = await prisma.notification.findMany({ where: { applicationId: app.id }, orderBy: { createdAt: 'asc' } })
    console.log('Notifications (ordered):', notif)
  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
})().catch((e) => { console.error(e); process.exit(1) })
