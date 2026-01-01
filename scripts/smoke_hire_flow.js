#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()

    // Create fresh users
    const creator = await prisma.user.create({ data: { email: `creator.hire.test${Date.now()}@example.com`, credits: 0 } })
    const applicant = await prisma.user.create({ data: { email: `applicant.hire.test${Date.now()}@example.com`, credits: 5 } })
    console.log('Creator:', creator.id, 'Applicant:', applicant.id)

    // Creator creates a direct hire (task + pending application)
    const task = await prisma.task.create({ data: { title: 'Smoke Hire Task', description: 'smoke', price: 300, creatorId: creator.id, isOpen: true, isDirectHire: true } })
    const application = await prisma.application.create({ data: { taskId: task.id, applicantId: applicant.id, proposedPrice: task.price, lastProposedBy: creator.id, status: 'offered' } })
    console.log('Created direct hire app', application.id, 'proposedPrice', application.proposedPrice, 'status', application.status)

    // Applicant sends counter-offer to 200 (reserve 2 credits)
    const counterPrice = 200
    console.log('Applicant sending counter-offer to', counterPrice)
    const newCredits = Math.max(1, counterPrice / 100)

    await prisma.$transaction(async (tx) => {
      const currentApp = await tx.application.findUnique({ where: { id: application.id }, include: { task: true } })
      const prevCharged = currentApp.chargedCredits ?? 0
      const delta = newCredits - prevCharged
      if (delta > 0) {
        const updated = await tx.$queryRaw`UPDATE "User" SET credits = credits - ${delta} WHERE id = ${applicant.id} AND credits >= ${delta} RETURNING credits`
        if (!updated || updated.length === 0) throw new Error('Insufficient credits for reservation')
        await tx.creditTransaction.create({ data: { userId: applicant.id, amount: delta, type: 'spent', description: `Reservation for counter-offer ${application.id}`, relatedTaskId: task.id } })
        await tx.application.update({ where: { id: application.id }, data: { chargedCredits: prevCharged + delta, proposedPrice: counterPrice, lastProposedBy: applicant.id, status: 'counter_proposed' } })
      } else if (delta < 0) {
        const refund = -delta
        await tx.user.update({ where: { id: applicant.id }, data: { credits: { increment: refund } } })
        await tx.creditTransaction.create({ data: { userId: applicant.id, amount: refund, type: 'refund', description: `Refund for counter-offer ${application.id}`, relatedTaskId: task.id } })
        await tx.application.update({ where: { id: application.id }, data: { chargedCredits: newCredits, proposedPrice: counterPrice, lastProposedBy: applicant.id, status: 'counter_proposed' } })
      } else {
        await tx.application.update({ where: { id: application.id }, data: { proposedPrice: counterPrice, lastProposedBy: applicant.id, status: 'counter_proposed' } })
      }
    })

    console.log('After reservation applicant credits:', (await prisma.user.findUnique({ where: { id: applicant.id } })).credits)
    console.log('App after reservation:', await prisma.application.findUnique({ where: { id: application.id } }))

    // Creator accepts the counter-offer
    console.log('Creator accepting the counter-offer...')
    await prisma.$transaction(async (tx) => {
      const currentApp = await tx.application.findUnique({ where: { id: application.id }, include: { task: true } })
      const totalRequired = Math.max(1, (((currentApp.proposedPrice ?? currentApp.task.price) || 0) / 100))
      const alreadyCharged = currentApp.chargedCredits ?? 0

      // since applicant already reserved, delta should be 0
      const delta = totalRequired - alreadyCharged
      if (delta > 0) {
        const rows = await tx.$queryRaw`UPDATE "User" SET credits = credits - ${delta} WHERE id = ${currentApp.applicantId} AND credits >= ${delta} RETURNING credits`
        if (!rows || rows.length === 0) throw new Error('Insufficient credits to complete acceptance')
        await tx.creditTransaction.create({ data: { userId: currentApp.applicantId, amount: delta, type: 'spent', description: `Charge for application ${currentApp.id} (accept)`, relatedTaskId: currentApp.taskId } })
      }

      await tx.application.update({ where: { id: application.id }, data: { chargedCredits: totalRequired, status: 'accepted', selectedAt: new Date() } })
      await tx.notification.create({ data: { userId: currentApp.applicantId, type: 'application_accepted', content: `Your application for "${currentApp.task.title}" has been accepted!`, taskId: currentApp.taskId, applicationId: currentApp.id } })
    })

    console.log('After accept applicant credits:', (await prisma.user.findUnique({ where: { id: applicant.id } })).credits)
    console.log('Applicant spent transactions:', await prisma.creditTransaction.findMany({ where: { userId: applicant.id, type: 'spent' } }))

  } catch (err) {
    if (err && err.code === 'P2022') {
      console.error('Database schema mismatch detected. It looks like your local DB is missing the latest migrations (e.g., Application.acceptedBy).')
      console.error('Run migrations against a local dev database (not production). Example:')
      console.error("  - Start a local Postgres (Docker) or use a dev DB; set DATABASE_URL appropriately; then run: npx prisma migrate dev --name apply-local")
      console.error('After applying migrations, re-run this script.')
    } else {
      console.error('Error in smoke hire flow:', err)
    }
  } finally {
    await prisma.$disconnect()
  }
})().catch((e) => { console.error(e); process.exit(1) })
