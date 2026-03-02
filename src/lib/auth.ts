import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'

const devProviders =
  process.env.NODE_ENV !== 'production'
    ? [
        CredentialsProvider({
          name: 'Dev email login',
          credentials: {
            email: { label: 'Email', type: 'email', placeholder: 'test@primer.com' },
          },
          async authorize(credentials) {
            if (!credentials?.email) return null
            const user = await prisma.user.upsert({
              where: { email: credentials.email },
              update: {},
              create: {
                email: credentials.email,
                name: credentials.email.split('@')[0],
              },
            })
            return { id: user.id, email: user.email, name: user.name }
          },
        }),
      ]
    : []

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...devProviders,
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.id = user.id
      return token
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
      },
    }),
  },
}
