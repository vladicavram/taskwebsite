#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    console.log('Creating users...')
    const creator = await prisma.user.create({ data: { email: `creator+test${Date.now()}@example.com`, credits: 10 } })
    const applicant = await prisma.user.create({ data: { email: `applicant+test${Date.now()}@example.com`, credits: 0 } })

    console.log({ creator: creator.id, applicant: applicant.id })

    const task = await prisma.task.create({ data: { title: 'Smoke test task', description: 'smoke', price: 300, creatorId: creator.id, isOpen: true, isDirectHire: true } })

    const application = await prisma.application.create({ data: { taskId: task.id, applicantId: applicant.id, proposedPrice: task.price, lastProposedBy: creator.id } })

    console.log('Initial application:', application.id, 'proposedPrice', application.proposedPrice)

    // Applicant sends counter-offer lower
    const newPrice = 200 // lower than 300
    console.log('Applicant sending counter-offer to', newPrice)
    await prisma.application.update({ where: { id: application.id }, data: { proposedPrice: newPrice, lastProposedBy: applicant.id } })

    const updated = await prisma.application.findUnique({ where: { id: application.id } })
    console.log('After counter-offer:', updated.proposedPrice, 'lastProposedBy', updated.lastProposedBy)

    // Now attempt to accept as applicant using the same logic as server
    console.log('Attempting accept transaction (should fail)')
    try {
      const result = await prisma.$transaction(async (tx) => {
        const currentApp = await tx.application.findUnique({ where: { id: application.id }, include: { task: true } })
        const totalRequired = Math.max(1, (((currentApp.proposedPrice ?? currentApp.task.price) || 0) / 100))
        const alreadyCharged = currentApp.chargedCredits ?? 0
        const freshApplicant = await tx.user.findUnique({ where: { id: currentApp.applicantId } })
        const availableIncludingReserved = (freshApplicant.credits || 0) + (alreadyCharged || 0)
        const lastProposedByApplicant = currentApp.lastProposedBy === currentApp.applicantId
        const hasReserved = currentApp.chargedCredits && currentApp.chargedCredits > 0
        console.log({ totalRequired, alreadyCharged, freshCredits: freshApplicant.credits, lastProposedByApplicant, hasReserved, availableIncludingReserved })
        if (lastProposedByApplicant && !hasReserved) {
          if ((freshApplicant.credits || 0) < totalRequired) {
            throw new Error('INSUFFICIENT (expected)')
          }
        } else {
          if (availableIncludingReserved < totalRequired) {
            throw new Error('INSUFFICIENT (expected)')
          }
        }
        // If it didn't throw, perform decrement
        const delta = totalRequired - alreadyCharged
        if (delta > 0) {
          const rows = await tx.$queryRaw`UPDATE "User" SET credits = credits - ${delta} WHERE id = ${currentApp.applicantId} AND credits >= ${delta} RETURNING credits`
          if (!rows || rows.length === 0) {
            throw new Error('INSUFFICIENT (race)')
          }
        }
        await tx.application.update({ where: { id: application.id }, data: { chargedCredits: totalRequired, status: 'accepted', selectedAt: new Date() } })
        return true
      })
      console.log('Accept transaction unexpectedly succeeded', result)
    } catch (err) {
      console.log('Accept transaction failed as expected:', err.message)
    }

  } finally {
    await prisma.$disconnect()
  }
})().catch((e) => { console.error(e); process.exit(1) })
