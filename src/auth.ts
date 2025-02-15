import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "@/lib/prisma"
import Google from "next-auth/providers/google"
import Github from "next-auth/providers/github"
import { unstable_cache } from 'next/cache'

// Cached session lookup
const getSessionFromToken = async (token: string) => {
  return unstable_cache(
    async () => {
      return db.getSession(token)
    },
    [`session-${token}`],
    {
      revalidate: 60, // Cache for 1 minute
      tags: [`session-${token}`],
    }
  )()
}

// Create custom adapter with optimized queries
const createOptimizedAdapter = () => {
  const prismaAdapter = PrismaAdapter(db.getPrisma())

  return {
    ...prismaAdapter,
    // Optimize getSession to use our cached version
    async getSession(sessionToken) {
      try {
        const session = await getSessionFromToken(sessionToken)
        if (!session) return null
        return session
      } catch (error) {
        console.error('Error getting session:', error)
        return null
      }
    },
    // Optimize user lookup to use DataLoader
    async getUser(id) {
      try {
        return await db.getUser(id)
      } catch (error) {
        console.error('Error getting user:', error)
        return null
      }
    },
    // Optimize session creation with proper cache invalidation
    async createSession(data) {
      const session = await prismaAdapter.createSession(data)
      // Clear any existing session cache
      db.clearCache(`session-${session.sessionToken}`)
      return session
    },
    // Optimize session deletion with proper cache cleanup
    async deleteSession(sessionToken) {
      await prismaAdapter.deleteSession(sessionToken)
      db.clearCache(`session-${sessionToken}`)
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: createOptimizedAdapter(),
  providers: [Google, Github],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    // Cache user data in session
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id

        // Cache the full user data
        await unstable_cache(
          async () => user,
          [`user-${user.id}`],
          {
            revalidate: 300, // Cache for 5 minutes
            tags: [`user-${user.id}`],
          }
        )()
      }
      return session
    },
  },
})

// Export a helper to invalidate user cache
export const invalidateUserCache = (userId: string) => {
  db.clearCache(`user-${userId}`)
  db.clearLoader('user')
}

// Export a helper to invalidate session cache
export const invalidateSessionCache = (sessionToken: string) => {
  db.clearCache(`session-${sessionToken}`)
}
