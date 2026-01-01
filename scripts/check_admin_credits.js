#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    const admin = await prisma.user.findUnique({ where: { email: 'admin@taskwebsite.com' } })
    console.log('Admin:', admin?.id, 'credits:', admin?.credits)
  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
})().catch((e) => { console.error(e); process.exit(1) })
