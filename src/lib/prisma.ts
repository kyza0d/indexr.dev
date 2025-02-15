import { PrismaClient } from '@prisma/client'
import { PrismaService } from './prisma/service'

// Types for the global prisma instance
declare global {
  var prisma: PrismaClient | undefined
  var db: PrismaService | undefined
}

// Create or reuse the Prisma instance
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
})

// Create or reuse the PrismaService instance
export const db = global.db || PrismaService.getInstance()

// In development, preserve instances across hot-reloads
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
  global.db = db
}

// For backwards compatibility
export { prisma }

// Export types
export type { PrismaService }

// Default export for backwards compatibility
export default prisma
