const healthPlugin = async (app) => {
    app.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }));
};
export default healthPlugin;
//# sourceMappingURL=health.js.map