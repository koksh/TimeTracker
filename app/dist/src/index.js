import fastify from 'fastify';
import usersRoutes from './routers/users.js';
import timeRoutes from './routers/time.js';
import smileRoutes from './routers/smile.js';
import eventRoutes from './routers/events.js';
import healthPlugin from './plugins/health.js';
import dbPlugin from './plugins/db.js';
import swaggerPlugin from './plugins/swagger.js';
export function buildApp() {
    const app = fastify({ logger: true });
    app.register(dbPlugin);
    app.register(healthPlugin);
    app.register(swaggerPlugin);
    app.register(eventRoutes, { prefix: '/events' });
    app.register(timeRoutes, { prefix: '/time' });
    app.register(smileRoutes, { prefix: '/smile' });
    app.register(usersRoutes, { prefix: '/users' });
    app.setNotFoundHandler((_request, reply) => {
        reply.status(404).send({ error: 'Route not found' });
    });
    app.setErrorHandler((error, _request, reply) => {
        app.log.error(error);
        const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500;
        const message = typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
            ? error.message
            : 'Internal Server Error';
        reply.status(statusCode).send({ error: message });
    });
    return app;
}
//# sourceMappingURL=index.js.map