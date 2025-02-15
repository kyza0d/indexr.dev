import { PrismaClient, Dataset, User, Tag, SavedDataset } from '@prisma/client';
import NodeCache from 'node-cache';
import DataLoader from 'dataloader';
import { unstable_cache } from 'next/cache';

export type DatasetWithRelations = Dataset & {
  tags: Tag[];
  user: Pick<User, 'id' | 'name' | 'image'>;
  savedBy: Pick<SavedDataset, 'userId'>[];
};

type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export class PrismaService {
  private static instance: PrismaService;
  private prisma: PrismaClient;
  public cache: NodeCache;
  private loaders: Map<string, DataLoader<any, any>>;

  private constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    });

    this.cache = new NodeCache({
      stdTTL: 300,
      checkperiod: 60,
      useClones: false,
    });

    this.loaders = new Map();
    this.initializeLoaders();
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  private initializeLoaders() {
    // Initialize DataLoader for users
    this.loaders.set('user', new DataLoader(async (ids: readonly string[]) => {
      const users = await this.prisma.user.findMany({
        where: { id: { in: [...ids] } },
      });
      return ids.map(id => users.find(user => user.id === id));
    }));

    // Initialize DataLoader for datasets
    this.loaders.set('dataset', new DataLoader(async (ids: readonly string[]) => {
      const datasets = await this.prisma.dataset.findMany({
        where: { id: { in: [...ids] } },
        include: {
          tags: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          savedBy: {
            select: {
              userId: true,
            },
          },
        },
      });
      return ids.map(id => datasets.find(dataset => dataset.id === id));
    }));

    // Initialize DataLoader for tags
    this.loaders.set('tag', new DataLoader(async (ids: readonly string[]) => {
      const tags = await this.prisma.tag.findMany({
        where: { id: { in: [...ids] } },
      });
      return ids.map(id => tags.find(tag => tag.id === id));
    }));
  }

  public async getSession(token: string) {
    return unstable_cache(
      async () => {
        return this.prisma.session.findUnique({
          where: { sessionToken: token },
          include: {
            user: true,
          },
        });
      },
      [`session-${token}`],
      {
        revalidate: 60,
        tags: [`session-${token}`],
      }
    )();
  }

  public async getDataset(id: string): Promise<DatasetWithRelations | null> {
    const loader = this.loaders.get('dataset');
    if (!loader) {
      throw new Error('Dataset loader not initialized');
    }
    return loader.load(id);
  }

  public async getRecentDatasets(userId: string, limit: number = 10) {
    return this.prisma.dataset.findMany({
      where: {
        OR: [
          { userId },
          { isPublic: true },
          {
            views: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        views: {
          where: {
            userId,
          },
          orderBy: {
            viewedAt: 'desc',
          },
          take: 1,
        },
        tags: true,
        savedBy: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: [
        {
          updatedAt: 'desc',
        },
      ],
      take: limit,
    });
  }

  public async getUser(id: string): Promise<User | null> {
    const loader = this.loaders.get('user');
    if (!loader) {
      throw new Error('User loader not initialized');
    }
    return loader.load(id);
  }

  public clearCache(key?: string) {
    if (key) {
      this.cache.del(key);
    } else {
      this.cache.flushAll();
    }
  }

  public clearLoader(loaderName: string) {
    const loader = this.loaders.get(loaderName);
    if (loader) {
      loader.clearAll();
    }
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  public async transaction<T>(
    fn: (tx: PrismaTransactionClient) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}

// Export singleton instance
export const prismaService = PrismaService.getInstance();
