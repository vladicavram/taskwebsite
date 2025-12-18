import { PrismaClient } from '@prisma/client'

declare global {
  // allow global prisma during hot-reload in dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

if (typeof window === 'undefined') {
  console.log('🔍 Prisma DB URL:', process.env.DATABASE_URL?.substring(0, 60) + '...')
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
