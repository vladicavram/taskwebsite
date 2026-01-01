#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    // Setup users
    const creator = await prisma.user.create({ data: { email: `creator.reserve@test${Date.now()}@example.com`, credits: 0 } })
    const applicant = await prisma.user.create({ data: { email: `applicant.reserve@test${Date.now()}@example.com`, credits: 5 } })
    console.log('Creator:', creator.id, 'Applicant:', applicant.id)

    const task = await prisma.task.create({ data: { title: 'Reserve flow test', description: 'reserve', price: 300, creatorId: creator.id, isOpen: true } })
    const application = await prisma.application.create({ data: { taskId: task.id, applicantId: applicant.id, proposedPrice: task.price, lastProposedBy: creator.id, status: 'offered' } })
    console.log('Initial app', application.id, 'proposedPrice', application.proposedPrice, 'status', application.status)

    // Applicant sends counter-offer (200 => 2 credits)
    const newPrice = 200
    console.log('Applicant sending counter-offer to', newPrice)
    await prisma.application.update({ where: { id: application.id }, data: { proposedPrice: newPrice, lastProposedBy: applicant.id } })

    // Now emulate server logic: reserve credits
    const newCredits = Math.max(1, newPrice / 100)
    const tx = await prisma.$transaction(async (tx) => {
      const currentApp = await tx.application.findUnique({ where: { id: application.id }, include: { task: true } })
      const prevCharged = currentApp.chargedCredits ?? 0
      const delta = newCredits - prevCharged
      if (delta > 0) {
        const updated = await tx.$queryRaw`UPDATE "User" SET credits = credits - ${delta} WHERE id = ${applicant.id} AND credits >= ${delta} RETURNING credits`
        if (!updated || updated.length === 0) throw new Error('Insufficient credits for reservation')
        await tx.creditTransaction.create({ data: { userId: applicant.id, amount: delta, type: 'spent', description: `Reservation for counter-offer ${application.id}`, relatedTaskId: task.id } })
        await tx.application.update({ where: { id: application.id }, data: { chargedCredits: prevCharged + delta, proposedPrice: newPrice, lastProposedBy: applicant.id, status: 'counter_proposed' } })
      } else if (delta < 0) {
        const refund = -delta
        await tx.user.update({ where: { id: applicant.id }, data: { credits: { increment: refund } } })
        await tx.creditTransaction.create({ data: { userId: applicant.id, amount: refund, type: 'refund', description: `Refund for counter-offer ${application.id}`, relatedTaskId: task.id } })
        await tx.application.update({ where: { id: application.id }, data: { chargedCredits: newCredits, proposedPrice: newPrice, lastProposedBy: applicant.id, status: 'counter_proposed' } })
      } else {
        await tx.application.update({ where: { id: application.id }, data: { proposedPrice: newPrice, lastProposedBy: applicant.id, status: 'counter_proposed' } })
      }
      return true
    })
    console.log('Reservation made. Applicant credits now:', (await prisma.user.findUnique({ where: { id: applicant.id } })).credits)
    console.log('App after reserve:', await prisma.application.findUnique({ where: { id: application.id } }))

    // Creator declines — emulate refund
    console.log('Creator declining...')
    await prisma.$transaction(async (tx) => {
      const currentApp = await tx.application.findUnique({ where: { id: application.id } })
      const charged = currentApp.chargedCredits ?? 0
      await tx.application.update({ where: { id: application.id }, data: { status: 'declined' } })
      if (charged > 0) {
        await tx.user.update({ where: { id: applicant.id }, data: { credits: { increment: charged } } })
        await tx.creditTransaction.create({ data: { userId: applicant.id, amount: charged, type: 'refund', description: `Refund after decline for ${application.id}`, relatedTaskId: task.id } })
        await tx.application.update({ where: { id: application.id }, data: { chargedCredits: 0 } })
      }
      return true
    })

    console.log('After decline applicant credits:', (await prisma.user.findUnique({ where: { id: applicant.id } })).credits)
    console.log('App after decline:', await prisma.application.findUnique({ where: { id: application.id } }))

  } catch (err) {
    console.error('Error in test:', err)
  } finally {
    await prisma.$disconnect()
  }
})().catch((e) => { console.error(e); process.exit(1) })
