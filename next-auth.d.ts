import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    publicByDefault?: boolean
    autoTag?: boolean
    tags?: string[]
  }

  interface Session {
    user: User
  }
}
