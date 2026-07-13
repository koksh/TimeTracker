import type { FastifyPluginAsync } from 'fastify';

const healthPlugin: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }));
};

export default healthPlugin;
