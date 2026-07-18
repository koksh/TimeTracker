import type { FastifyPluginAsync } from 'fastify';

const timeRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/',
    {
      schema: {
        description: 'Get total tracked time and all time records',
        tags: ['time'],
        response: {
          200: {
            type: 'object',
            properties: {
              totalMinutes: { type: 'number' },
              records: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    minutes: { type: 'number' },
                    date: { type: 'string' },
                    note: { type: ['string', 'null'] },
                    userId: { type: ['number', 'null'] },
                  },
                },
              },
            },
          },
        },
      },
    },
    async () => {
      const records = await app.prisma.timeRecord.findMany({
        select: {
          id: true,
          minutes: true,
          date: true,
          note: true,
          userId: true,
        },
        orderBy: { id: 'desc' },
      });

      const totalMinutes = records.reduce((sum: number, record) => sum + record.minutes, 0);
      return { totalMinutes, records };
    },
  );

  app.post<{
    Body: { minutes: number; date?: string; note?: string; userId?: number };
  }>(
    '/',
    {
      schema: {
        description: 'Create a time record',
        tags: ['time'],
        body: {
          type: 'object',
          required: ['minutes'],
          properties: {
            minutes: { type: 'number' },
            date: { type: 'string' },
            note: { type: 'string' },
            userId: { type: 'number' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              minutes: { type: 'number' },
              date: { type: 'string' },
              note: { type: ['string', 'null'] },
              userId: { type: ['number', 'null'] },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { minutes, date, note, userId } = request.body;
      const created = await app.prisma.timeRecord.create({
        data: {
          minutes,
          date: date ? new Date(date) : new Date(),
          note: note ?? null,
          userId: userId ?? null,
        },
        select: {
          id: true,
          minutes: true,
          date: true,
          note: true,
          userId: true,
        },
      });

      reply.status(201);
      return created;
    },
  );
};

export default timeRoutes;
