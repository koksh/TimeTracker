const events = [];
const eventRoutes = async (app) => {
    app.get('/', {
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
    }, async () => ({ count: events.length, events }));
    app.post('/', {
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
    }, async (request, reply) => {
        const payload = request.body;
        events.push(payload);
        reply.status(201);
        return { success: true, event: payload };
    });
};
export default eventRoutes;
//# sourceMappingURL=events.js.map