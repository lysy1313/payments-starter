import app from './app.js';
import { config } from './config.js';

const server = app.listen(config.port, '127.0.0.1', () => {
  console.log(`Backend: http://localhost:${config.port}/api/health`);
});
process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());
