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
        console.log('🔍 Password length:', credentials.password?.length)
        
        const user = await prisma.user.findFirst({ 
          where: { 
            OR: [
              { email: credentials.usernameOrEmail },
              { username: credentials.usernameOrEmail }
            ]
          }
        })
        
        if (!user) {
          console.log('❌ User not found for:', credentials.usernameOrEmail)
          // Check total users
          const count = await prisma.user.count()
          console.log('📊 Total users in DB:', count)
          return null
        }
        
        console.log('✓ User found:', user.email, '/', user.username)
        console.log('✓ Is Admin:', user.isAdmin)
        console.log('✓ Blocked:', user.blocked)
        
        if (user.blocked) {
          console.log('❌ User is blocked')
          throw new Error('USER_BLOCKED')
        }
        
        if (!user.password) {
          console.log('❌ User has no password')
          return null
        }
        
        console.log('✓ Has password, checking...')
        const ok = compareSync(credentials.password, user.password)
        console.log('✓ Password check:', ok ? '✅ PASS' : '❌ FAIL')
        
        if (!ok) {
          console.log('❌ Password mismatch for:', user.email)
          return null
        }
        
        console.log('✅ Login successful for:', user.name, '(', user.email, ')')
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
