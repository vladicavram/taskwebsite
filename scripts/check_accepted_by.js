#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    const a = await prisma.application.findUnique({ where: { id: 'cmjt8eknj0009dt51rgarp5sf' } })
    console.log('Application:', a)
  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
})().catch((e) => { console.error(e); process.exit(1) })
