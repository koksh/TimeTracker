import type { FastifyPluginAsync } from 'fastify';
import type { User } from '../types.js';

const userRoutes: FastifyPluginAsync = async (app) => {
  app.get('/',
  {
    schema: {
      description: 'List all users',
      tags: ['users'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              username: { type: 'string' },
            },
          },
        },
      },
    },
  },
  async () => {
    return app.prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
      orderBy: { id: 'asc' },
    });
  });

  app.get<{
    Params: { id: string };
  }>('/:id',
  {
    schema: {
      description: 'Get a user by ID',
      tags: ['users'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
  },
  async (request, reply) => {
    const userId = Number(request.params.id);
    const user = await app.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });

    if (!user) {
      reply.status(404);
      return { error: 'User not found' };
    }

    return user;
  });

  app.post<{
    Body: { username: string; password?: string | undefined };
  }>('/',
  {
    schema: {
      description: 'Create a new user',
      tags: ['users'],
      body: {
        type: 'object',
        required: ['username'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
          },
        },
      },
    },
  },
  async (request, reply) => {
    const { username, password } = request.body;
    const user = await app.prisma.user.create({
      data: {
        username,
        password: password ?? null,
      },
      select: {
        id: true,
        username: true,
      },
    });

    reply.status(201);
    return user;
  });

  app.put<{
    Params: { id: string };
    Body: { username: string };
  }>('/:id',
  {
    schema: {
      description: 'Update a user username',
      tags: ['users'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['username'],
        properties: {
          username: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
  },
  async (request, reply) => {
    const userId = Number(request.params.id);
    const { username } = request.body;

    const user = await app.prisma.user.update({
      where: { id: userId },
      data: { username },
      select: { id: true, username: true },
    }).catch(() => null);

    if (!user) {
      reply.status(404);
      return { error: 'User not found' };
    }

    return user;
  });

  app.delete<{
    Params: { id: string };
  }>('/:id',
  {
    schema: {
      description: 'Delete a user',
      tags: ['users'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        204: {
          type: 'null',
        },
        404: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
  },
  async (request, reply) => {
    const userId = Number(request.params.id);

    const deleted = await app.prisma.user.delete({
      where: { id: userId },
    }).catch(() => null);

    if (!deleted) {
      reply.status(404);
      return { error: 'User not found' };
    }

    reply.status(204).send();
  });
};

export default userRoutes;
