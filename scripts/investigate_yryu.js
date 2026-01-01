#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    const carol = await prisma.user.findUnique({ where: { email: 'carol@example.com' } })
    const admin = await prisma.user.findUnique({ where: { email: 'admin@taskwebsite.com' } })
    console.log('Carol:', carol?.id, 'Admin:', admin?.id, 'Admin credits:', admin?.credits)

    const tasks = await prisma.task.findMany({ where: { title: 'yryu', creatorId: carol?.id, price: 657788 }, include: { applications: true } })
    console.log('Found tasks:', tasks.length)
    for (const task of tasks) {
      console.log('\nTask', task.id, 'price', task.price, 'isOpen', task.isOpen, 'createdAt', task.createdAt)
      const apps = await prisma.application.findMany({ where: { taskId: task.id }, include: { applicant: true } })
      for (const app of apps) {
        console.log(' Application', app.id, 'applicant', app.applicant.email, 'status', app.status, 'proposedPrice', app.proposedPrice, 'chargedCredits', app.chargedCredits, 'lastProposedBy', app.lastProposedBy, 'createdAt', app.createdAt, 'selectedAt', app.selectedAt)
        const txs = await prisma.creditTransaction.findMany({ where: { userId: app.applicantId }, orderBy: { createdAt: 'asc' } })
        console.log('  Applicant credit txs (last 20):', txs.slice(-20))
      }

      // Any transactions tied to this task
      const relatedTxs = await prisma.creditTransaction.findMany({ where: { relatedTaskId: task.id }, orderBy: { createdAt: 'asc' } })
      console.log(' Related txs for this task:', relatedTxs)
    }

    // Find accepted apps where admin is applicant and look for missing spent txs
    const accepted = await prisma.application.findMany({ where: { applicantId: admin?.id, status: 'accepted' }, include: { task: true } })
    console.log('\nAdmin accepted applications:', accepted.length)
    for (const a of accepted) {
      console.log(' Admin accepted app', a.id, 'task', a.taskId, 'task title', a.task.title, 'price', a.proposedPrice ?? a.task.price, 'chargedCredits', a.chargedCredits, 'selectedAt', a.selectedAt)
      const txs = await prisma.creditTransaction.findMany({ where: { userId: admin?.id }, orderBy: { createdAt: 'asc' } })
      console.log('  Admin credit txs recent (20):', txs.slice(-20))
      const spentForThis = txs.filter(x => x.type === 'spent' && x.relatedTaskId === a.taskId)
      if (spentForThis.length === 0) {
        console.log('  WARNING: no spent transactions found for this accept (taskId=', a.taskId, ')')
      } else {
        console.log('  Found spent txs:', spentForThis)
      }
    }

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await prisma.$disconnect()
  }
})().catch((e) => { console.error(e); process.exit(1) })
