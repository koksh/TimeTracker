import type { FastifyPluginAsync } from 'fastify';
import type { TimeRecord } from '../types.js';

const timeRoutes: FastifyPluginAsync = async (app) => {
  app.get('/',
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
    const result = await app.db.query<TimeRecord>(`
      SELECT id, minutes, date, note, user_id AS "userId"
      FROM time_records
      ORDER BY id DESC
    `);

    const totalMinutes = result.rows.reduce((sum, record) => sum + record.minutes, 0);
    return { totalMinutes, records: result.rows };
  });

  app.post<{
    Body: { minutes: number; date?: string; note?: string | undefined; userId?: number };
  }>('/',
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
    const result = await app.db.query<TimeRecord>(`
      INSERT INTO time_records (minutes, date, note, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, minutes, date, note, user_id AS "userId"
    `, [
      minutes,
      date ? new Date(date).toISOString() : new Date().toISOString(),
      note ?? null,
      userId ?? null,
    ]);

    reply.status(201);
    return result.rows[0];
  });
};

export default timeRoutes;
