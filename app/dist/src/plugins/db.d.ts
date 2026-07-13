import type { FastifyPluginAsync } from 'fastify';
declare module 'fastify' {
    interface FastifyInstance {
        db: {
            initialized: boolean;
        };
    }
}
declare const dbPlugin: FastifyPluginAsync;
export default dbPlugin;
//# sourceMappingURL=db.d.ts.map