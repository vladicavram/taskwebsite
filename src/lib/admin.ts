import { getServerSession } from 'next-auth/next'
import { authOptions } from '../app/api/auth/[...nextauth]/authOptions'
import { prisma } from './prisma'

export async function isAdmin(): Promise<boolean> {
  const session: any = await getServerSession(authOptions as any)
  if (!session?.user?.email) return false
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true, role: true }
  })
  
  return user?.isAdmin ?? false
}

export async function isModerator(): Promise<boolean> {
  const session: any = await getServerSession(authOptions as any)
  if (!session?.user?.email) return false
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  })
  
  return user?.role === 'moderator' || user?.role === 'admin'
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Admin access required')
  }
}

export async function requireModerator() {
  const moderator = await isModerator()
  if (!moderator) {
    throw new Error('Moderator access required')
  }
}
