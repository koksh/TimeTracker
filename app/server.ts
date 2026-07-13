import { buildApp } from './src/index.js';

const start = async () => {
  try {
    const app = await buildApp();
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
