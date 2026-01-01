#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    const tasks = await prisma.task.findMany({ where: { title: 'uttu' }, include: { creator: true, applications: true } })
    console.log('Found tasks titled "uttu":', tasks.length)
    if (tasks.length === 0) {
      // try case-insensitive search
      const tasksCI = await prisma.task.findMany({ where: { title: { contains: 'uttu', mode: 'insensitive' } }, include: { creator: true, applications: true } })
      console.log('Case-insensitive matches:', tasksCI.length)
      for (const t of tasksCI) console.log(' ', t.id, t.title, 'creator', t.creator?.email, 'price', t.price, 'isOpen', t.isOpen)
      if (tasksCI.length === 0) return
    }

    for (const task of tasks) {
      console.log('\nTask', task.id, 'title', task.title, 'price', task.price, 'creator', task.creator?.email, 'isOpen', task.isOpen, 'createdAt', task.createdAt)
      const apps = await prisma.application.findMany({ where: { taskId: task.id }, include: { applicant: true } })
      console.log(' Applications found:', apps.length)
      for (const app of apps) {
        console.log('  App', app.id, 'applicant', app.applicant.email, 'status', app.status, 'proposedPrice', app.proposedPrice, 'chargedCredits', app.chargedCredits, 'lastProposedBy', app.lastProposedBy, 'createdAt', app.createdAt, 'selectedAt', app.selectedAt)
        const applicantTxs = await prisma.creditTransaction.findMany({ where: { userId: app.applicantId }, orderBy: { createdAt: 'asc' } })
        console.log('   Applicant credit txs (last 20):', applicantTxs.slice(-20))
        const creatorTxs = await prisma.creditTransaction.findMany({ where: { userId: task.creatorId }, orderBy: { createdAt: 'asc' } })
        console.log('   Creator credit txs (last 20):', creatorTxs.slice(-20))
        const relatedTxs = await prisma.creditTransaction.findMany({ where: { relatedTaskId: task.id }, orderBy: { createdAt: 'asc' } })
        console.log('   Related txs to this task (all):', relatedTxs)
      }

    }
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await prisma.$disconnect()
  }
})().catch((e) => { console.error(e); process.exit(1) })
