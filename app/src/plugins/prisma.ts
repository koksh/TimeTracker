import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import type { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin: FastifyPluginAsync = async (app) => {
  const connectionString =
    process.env.DATABASE_URL ??
    `postgresql://${process.env.PGUSER ?? 'postgres'}:${process.env.PGPASSWORD ?? 'postgres'}@${process.env.PGHOST ?? 'db'}:${process.env.PGPORT ?? 5432}/${process.env.PGDATABASE ?? 'time_tracker'}?schema=public`;

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });

  app.decorate('prisma', prisma);

  await prisma.$connect();

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
};

export default fp(prismaPlugin);
