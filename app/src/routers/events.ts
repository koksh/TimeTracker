import type { FastifyPluginAsync } from 'fastify';
import type { TrackingEvent } from '../types.js';

const eventRoutes: FastifyPluginAsync = async (app) => {
  app.get('/',
  {
    schema: {
      description: 'List stored events',
      tags: ['events'],
      response: {
        200: {
          type: 'object',
          properties: {
            count: { type: 'number' },
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  event: { type: 'string' },
                  timestamp: { type: 'string' },
                  elapsedMs: { type: 'number' },
                  activeTimeMs: { type: 'number' },
                  file: {
                    anyOf: [
                      { type: 'null' },
                      {
                        type: 'object',
                        properties: {
                          path: { type: 'string' },
                          language: { type: 'string' },
                          fileName: { type: 'string' },
                          workspaceFolder: { type: ['string', 'null'] },
                        },
                      },
                    ],
                  },
                  session: {
                    type: 'object',
                    properties: {
                      hostname: { type: 'string' },
                      user: { type: 'string' },
                      startedAt: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  async () => {
    type EventRow = {
      event: string;
      timestamp: string;
      elapsedMs: number;
      activeTimeMs: number;
      file_path: string | null;
      file_language: string | null;
      file_name: string | null;
      workspace_folder: string | null;
      session_hostname: string;
      session_user_name: string;
      session_started_at: string;
    };

    const result = await app.db.query<EventRow>(`
      SELECT
        event,
        event_timestamp AS "timestamp",
        elapsed_ms AS "elapsedMs",
        active_time_ms AS "activeTimeMs",
        file_path,
        file_language,
        file_name,
        workspace_folder,
        session_hostname,
        session_user_name,
        session_started_at
      FROM events
      ORDER BY id DESC
    `);

    const events = result.rows.map((row) => ({
      event: row.event,
      timestamp: row.timestamp,
      elapsedMs: row.elapsedMs,
      activeTimeMs: row.activeTimeMs,
      file: row.file_path === null && row.file_language === null && row.file_name === null && row.workspace_folder === null
        ? null
        : {
          path: row.file_path,
          language: row.file_language,
          fileName: row.file_name,
          workspaceFolder: row.workspace_folder,
        },
      session: {
        hostname: row.session_hostname,
        user: row.session_user_name,
        startedAt: row.session_started_at,
      },
    }));

    return { count: events.length, events };
  });

  app.post<{
    Body: TrackingEvent;
  }>('/',
  {
    schema: {
      description: 'Store an event',
      tags: ['events'],
      body: {
        type: 'object',
        required: ['event', 'timestamp', 'elapsedMs', 'activeTimeMs', 'file', 'session'],
        properties: {
          event: { type: 'string' },
          timestamp: { type: 'string' },
          elapsedMs: { type: 'number' },
          activeTimeMs: { type: 'number' },
          file: {
            anyOf: [
              { type: 'null' },
              {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  language: { type: 'string' },
                  fileName: { type: 'string' },
                  workspaceFolder: { type: ['string', 'null'] },
                },
              },
            ],
          },
          session: {
            type: 'object',
            properties: {
              hostname: { type: 'string' },
              user: { type: 'string' },
              startedAt: { type: 'string' },
            },
          },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            event: { type: 'object' },
          },
        },
      },
    },
  },
  async (request, reply) => {
    const payload = request.body;
    await app.db.query(`
      INSERT INTO events (
        event,
        event_timestamp,
        elapsed_ms,
        active_time_ms,
        file_path,
        file_language,
        file_name,
        workspace_folder,
        session_hostname,
        session_user_name,
        session_started_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `, [
      payload.event,
      payload.timestamp,
      payload.elapsedMs,
      payload.activeTimeMs,
      payload.file?.path ?? null,
      payload.file?.language ?? null,
      payload.file?.fileName ?? null,
      payload.file?.workspaceFolder ?? null,
      payload.session.hostname,
      payload.session.user,
      payload.session.startedAt,
    ]);

    reply.status(201);
    return { success: true, event: payload };
  });
};

export default eventRoutes;
