const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const pw = bcrypt.hashSync('password123', 10)

  // Upsert a poster (task creator)
  const poster = await prisma.user.upsert({
    where: { email: 'e2e-poster@example.com' },
    update: {},
    create: {
      email: 'e2e-poster@example.com',
      name: 'E2E Poster',
      password: pw,
      credits: 100
    }
  })

  // Upsert a worker (hired applicant)
  const worker = await prisma.user.upsert({
    where: { email: 'e2e-worker@example.com' },
    update: {},
    create: {
      email: 'e2e-worker@example.com',
      name: 'E2E Worker',
      password: pw,
      credits: 10,
      canApply: true
    }
  })

  // Create a direct-hire task (always create a new one to avoid altering existing data)
  const title = `E2E Direct Hire ${new Date().toISOString()}`
  const task = await prisma.task.create({
    data: {
      title,
      description: 'E2E test direct-hire task',
      price: 50,
      location: 'Test City',
      creatorId: poster.id,
      isDirectHire: true,
      isOpen: true
    }
  })

  // Create a pending application for the worker
  const application = await prisma.application.create({
    data: {
      taskId: task.id,
      applicantId: worker.id,
      proposedPrice: 50,
      message: 'Direct hire request - E2E test',
      status: 'pending',
      lastProposedBy: poster.id
    }
  })

  console.log('E2E seed complete:')
  console.log(' Poster:', { id: poster.id, email: poster.email })
  console.log(' Worker:', { id: worker.id, email: worker.email, credits: worker.credits })
  console.log(' Task:', { id: task.id, title: task.title })
  console.log(' Application:', { id: application.id, taskId: application.taskId, applicantId: application.applicantId })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
