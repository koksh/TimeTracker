const smileState = {
    startDate: new Date().toISOString(),
    finishDate: null,
    message: null,
};
const smileRoutes = async (app) => {
    app.get('/', {
        schema: {
            description: 'Get smile tracking state',
            tags: ['smile'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        startDate: { type: 'string' },
                        finishDate: { type: ['string', 'null'] },
                        message: { type: ['string', 'null'] },
                    },
                },
            },
        },
    }, async () => smileState);
    app.post('/', {
        schema: {
            description: 'Update smile tracking state',
            tags: ['smile'],
            body: {
                type: 'object',
                properties: {
                    startDate: { type: 'string' },
                    finishDate: { type: ['string', 'null'] },
                    message: { type: 'string' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        startDate: { type: 'string' },
                        finishDate: { type: ['string', 'null'] },
                        message: { type: ['string', 'null'] },
                    },
                },
            },
        },
    }, async (request) => {
        const { startDate, finishDate, message } = request.body;
        if (startDate) {
            smileState.startDate = startDate;
        }
        smileState.finishDate = finishDate ?? smileState.finishDate;
        smileState.message = message ?? smileState.message;
        return smileState;
    });
};
export default smileRoutes;
//# sourceMappingURL=smile.js.map