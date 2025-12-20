const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const taskId = 'cmje4nbe80003vvttwb4hnbu6'
  const workerEmail = 'e2e-worker@example.com'

  const worker = await prisma.user.findUnique({ where: { email: workerEmail } })
  if (!worker) return console.log('Worker not found')

  const existing = await prisma.application.findUnique({
    where: { taskId_applicantId: { taskId, applicantId: worker.id } }
  })

  console.log('Worker:', { id: worker.id, email: worker.email, credits: worker.credits })
  console.log('Existing application found:', !!existing)
  if (existing) console.log('Application status:', existing.status, 'proposedPrice=', existing.proposedPrice)

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  console.log('Task isDirectHire:', task.isDirectHire, 'price:', task.price)

  // Simulate applications/check response
  const active = existing && (existing.status === 'pending' || existing.status === 'accepted')
  console.log('Simulated /api/applications/check ->', { exists: !!active, status: existing?.status })

  // Simulate /api/tasks/:id/apply guard
  if (task.isDirectHire) {
    const activeForTask = await prisma.application.findFirst({ where: { taskId, status: { in: ['pending', 'accepted'] } } })
    console.log('Active application for task by applicantId:', activeForTask?.applicantId)
    if (activeForTask && activeForTask.applicantId !== worker.id) {
      console.log('Apply would be blocked: different active applicant')
    } else {
      console.log('Apply would be allowed (either no active app or same worker)')
    }
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
