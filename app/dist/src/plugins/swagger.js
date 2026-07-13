import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
const swaggerPlugin = async (app) => {
    await app.register(swagger, {
        mode: 'dynamic',
        openapi: {
            info: {
                title: 'Time Tracker API',
                description: 'API for user time tracking and event reporting',
                version: '1.0.0',
            },
            servers: [{ url: 'http://localhost:3000', description: 'Local server' }],
        },
    });
    await app.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
        staticCSP: true,
    });
};
export default swaggerPlugin;
//# sourceMappingURL=swagger.js.map