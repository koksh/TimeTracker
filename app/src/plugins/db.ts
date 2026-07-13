import type { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    db: {
      initialized: boolean;
    };
  }
}

const dbPlugin: FastifyPluginAsync = async (app) => {
  app.decorate('db', { initialized: true });
};

export default dbPlugin;
