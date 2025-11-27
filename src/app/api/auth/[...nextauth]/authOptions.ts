import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../../lib/prisma'
import { compareSync } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        usernameOrEmail: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) {
          console.log('❌ No credentials provided')
          return null
        }
        console.log('🔍 Login attempt for:', credentials.usernameOrEmail)
        const user = await prisma.user.findFirst({ 
          where: { 
            OR: [
              { email: credentials.usernameOrEmail },
              { username: credentials.usernameOrEmail }
            ]
          }
        })
        if (!user) {
          console.log('❌ User not found')
          return null
        }
        if (user.blocked) {
          // Special error for blocked users
          throw new Error('USER_BLOCKED')
        }
        if (!user.password) {
          console.log('❌ User has no password')
          return null
        }
        console.log('✓ User found:', user.name)
        const ok = compareSync(credentials.password, user.password)
        console.log('✓ Password check:', ok ? 'PASS' : 'FAIL')
        if (!ok) return null
        console.log('✅ Login successful for:', user.name)
        return { id: user.id, email: user.email, name: user.name }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || ''
    })
  ],
  pages: {
    signIn: '/en/login'
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // Use loose typing here to avoid strict augmentation requirements
    async session({ session, token }: any) {
      if (token?.sub) {
        session.user.id = token.sub
      }
      // Populate extra fields from DB
      if (session.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (user) {
          session.user.name = user.name || session.user.name
          ;(session.user as any).username = user.username || (session.user as any).username
          session.user.image = user.image || session.user.image
        }
      }
      return session
    }
  }
}
