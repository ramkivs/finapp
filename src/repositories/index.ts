import { FinancialRepositoryPort } from '../domain/types';
import { MemoryRepository } from './MemoryRepository';
// import { PrismaRepository } from './PrismaRepository';

/**
 * Gate 8 Repository Port:
 * Currently bound to MemoryRepository for live preview execution.
 * Substituting `new PrismaRepository()` implements PostgreSQL + Prisma persistence
 * with zero modifications to Domain Services, Application API, or React Components.
 */
export const repository: FinancialRepositoryPort = new MemoryRepository();
