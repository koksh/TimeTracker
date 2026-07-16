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
    const result = await app.db.query<User>(`
      SELECT id, username
      FROM users
      ORDER BY id
    `);
    return result.rows;
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
    const result = await app.db.query<User>(`
      SELECT id, username
      FROM users
      WHERE id = $1
    `, [userId]);

    if (result.rowCount === 0) {
      reply.status(404);
      return { error: 'User not found' };
    }

    return result.rows[0];
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
    const result = await app.db.query<User>(`
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING id, username
    `, [username, password ?? null]);

    reply.status(201);
    return result.rows[0];
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
    const result = await app.db.query<User>(`
      UPDATE users
      SET username = $1
      WHERE id = $2
      RETURNING id, username
    `, [username, userId]);

    if (result.rowCount === 0) {
      reply.status(404);
      return { error: 'User not found' };
    }

    return result.rows[0];
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
    const result = await app.db.query(`
      DELETE FROM users
      WHERE id = $1
    `, [userId]);

    if (result.rowCount === 0) {
      reply.status(404);
      return { error: 'User not found' };
    }

    reply.status(204).send();
  });
};

export default userRoutes;
