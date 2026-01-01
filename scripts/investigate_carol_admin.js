#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()

    const carol = await prisma.user.findUnique({ where: { email: 'carol@example.com' } })
    const admin = await prisma.user.findUnique({ where: { email: 'admin@taskwebsite.com' } })
    console.log('Carol:', carol?.id, 'Admin:', admin?.id, 'Admin credits:', admin?.credits)

    if (!carol) { console.log('Carol not found'); return }
    if (!admin) { console.log('Admin not found'); return }

    const tasks = await prisma.task.findMany({ where: { creatorId: carol.id, price: 64577888 }, include: { applications: true } })
    console.log('Tasks by Carol with price 64577888:', tasks.length)
    for (const task of tasks) {
      console.log('Task', task.id, 'isOpen', task.isOpen, 'createdAt', task.createdAt)
      const apps = await prisma.application.findMany({ where: { taskId: task.id }, include: { applicant: true } })
      for (const app of apps) {
        console.log(' Application', app.id, 'applicant', app.applicant.email, 'status', app.status, 'proposedPrice', app.proposedPrice, 'chargedCredits', app.chargedCredits, 'lastProposedBy', app.lastProposedBy, 'createdAt', app.createdAt, 'selectedAt', app.selectedAt)

        const txs = await prisma.creditTransaction.findMany({ where: { userId: app.applicantId }, orderBy: { createdAt: 'asc' } })
        console.log('  Credit txs for applicant (recent 10):')
        console.log(txs.slice(-10))
      }
    }

      // Check for any 'spent' transactions related to those tasks
      const relatedTxs = await prisma.creditTransaction.findMany({ where: { relatedTaskId: { in: tasks.map(t=>t.id) } }, orderBy: { createdAt: 'asc' } })
      console.log('Credit transactions related to Carol tasks:', relatedTxs)

    // If no tasks found, search for applications with that price directly
    if (tasks.length === 0) {
      const apps = await prisma.application.findMany({ where: { proposedPrice: 64577888 }, include: { task: true, applicant: true } })
      console.log('Applications with proposedPrice 64577888:', apps.length)
      for (const app of apps) {
        console.log(' App', app.id, 'task', app.taskId, 'creator', app.task.creatorId, 'applicant', app.applicant.email, 'status', app.status, 'chargedCredits', app.chargedCredits, 'createdAt', app.createdAt, 'selectedAt', app.selectedAt)
        const txs = await prisma.creditTransaction.findMany({ where: { userId: app.applicantId }, orderBy: { createdAt: 'asc' } })
        console.log('  Applicant txs recent 10')
        console.log(txs.slice(-10))
      }
    }

    // Search for any accepted application where applicant is admin
    const acceptedByAdmin = await prisma.application.findMany({ where: { applicantId: admin.id, status: 'accepted' }, include: { task: true } })
    console.log('Accepted applications where applicant is admin:', acceptedByAdmin.length)
    for (const a of acceptedByAdmin) {
      console.log(' Admin accepted app', a.id, 'task', a.taskId, 'price', a.proposedPrice ?? a.task.price, 'chargedCredits', a.chargedCredits, 'selectedAt', a.selectedAt)
        const txs = await prisma.creditTransaction.findMany({ where: { userId: admin.id }, orderBy: { createdAt: 'asc' } })
      console.log(' Admin transactions recent 20:')
      console.log(txs.slice(-20))
        const spentForThis = txs.filter(x => x.type === 'spent' && x.relatedTaskId === a.taskId)
        if (spentForThis.length === 0) {
          console.log('  WARNING: no spent transactions found for this accept (taskId=', a.taskId, ')')
        } else {
          console.log('  Found spent txs for this accept:', spentForThis)
        }
    }

  } catch (err) {
    console.error('Investigate error', err)
  } finally {
    await prisma.$disconnect()
  }
})().catch((e) => { console.error(e); process.exit(1) })
