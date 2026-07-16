import type { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import fp from 'fastify-plugin';

const corsPlugin: FastifyPluginAsync = async (app) => {
  await app.register(cors, {
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflight: true,
  });
};

export default fp(corsPlugin);
