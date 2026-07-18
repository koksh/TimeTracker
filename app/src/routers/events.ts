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
    const events = await app.prisma.event.findMany({
      orderBy: { id: 'desc' },
    });

    return {
      count: events.length,
      events: events.map((row) => ({
        event: row.event,
        timestamp: row.eventTimestamp.toISOString(),
        elapsedMs: row.elapsedMs,
        activeTimeMs: row.activeTimeMs,
        file:
          row.filePath === null &&
          row.fileLanguage === null &&
          row.fileName === null &&
          row.workspaceFolder === null
            ? null
            : {
                path: row.filePath,
                language: row.fileLanguage,
                fileName: row.fileName,
                workspaceFolder: row.workspaceFolder,
              },
        session: {
          hostname: row.sessionHostname,
          user: row.sessionUserName,
          startedAt: row.sessionStartedAt.toISOString(),
        },
      })),
    };
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
    await app.prisma.event.create({
      data: {
        event: payload.event,
        eventTimestamp: new Date(payload.timestamp),
        elapsedMs: payload.elapsedMs,
        activeTimeMs: payload.activeTimeMs,
        filePath: payload.file?.path ?? null,
        fileLanguage: payload.file?.language ?? null,
        fileName: payload.file?.fileName ?? null,
        workspaceFolder: payload.file?.workspaceFolder ?? null,
        sessionHostname: payload.session.hostname,
        sessionUserName: payload.session.user,
        sessionStartedAt: new Date(payload.session.startedAt),
      },
    });

    reply.status(201);
    return { success: true, event: payload };
  });
};

export default eventRoutes;
