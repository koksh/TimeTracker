import type { FastifyPluginAsync } from 'fastify';
import type { User } from '../types.js';

const users: User[] = [{ id: 1, username: 'Alice' }];
let nextId = 2;

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
  async () => users);

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
    const user = users.find((item) => item.id === userId);

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
    const newUser: User = password === undefined
      ? { id: nextId++, username }
      : { id: nextId++, username, password };
    users.push(newUser);

    reply.status(201);
    return newUser;
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
    const user = users.find((item) => item.id === userId);

    if (!user) {
      reply.status(404);
      return { error: 'User not found' };
    }

    user.username = username;
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
    const originalLength = users.length;

    for (let index = users.length - 1; index >= 0; index -= 1) {
      if (users[index]?.id === userId) {
        users.splice(index, 1);
      }
    }

    if (users.length === originalLength) {
      reply.status(404);
      return { error: 'User not found' };
    }

    reply.status(204).send();
  });
};

export default userRoutes;
