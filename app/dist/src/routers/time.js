const timeRecords = [];
let nextTimeRecordId = 1;
const timeRoutes = async (app) => {
    app.get('/', {
        schema: {
            description: 'Get total tracked time and all time records',
            tags: ['time'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        totalMinutes: { type: 'number' },
                        records: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    minutes: { type: 'number' },
                                    date: { type: 'string' },
                                    note: { type: ['string', 'null'] },
                                },
                            },
                        },
                    },
                },
            },
        },
    }, async () => {
        const totalMinutes = timeRecords.reduce((sum, record) => sum + record.minutes, 0);
        return { totalMinutes, records: timeRecords };
    });
    app.post('/', {
        schema: {
            description: 'Create a time record',
            tags: ['time'],
            body: {
                type: 'object',
                required: ['minutes'],
                properties: {
                    minutes: { type: 'number' },
                    date: { type: 'string' },
                    note: { type: 'string' },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        minutes: { type: 'number' },
                        date: { type: 'string' },
                        note: { type: ['string', 'null'] },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const { minutes, date, note } = request.body;
        const record = {
            id: nextTimeRecordId++,
            minutes,
            date: date ?? new Date().toISOString(),
            note: note ?? undefined,
        };
        timeRecords.push(record);
        reply.status(201);
        return record;
    });
};
export default timeRoutes;
//# sourceMappingURL=time.js.map