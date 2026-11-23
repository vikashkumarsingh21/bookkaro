import { createApp } from './app';
import { config } from './config';
import prisma from './config/db';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log('================================================================');
  console.log(`🚀 BOOKKARO Backend Service [Patna — Hotels, Dining & Salons]`);
  console.log(`📡 Listening on Port: ${config.port} (${config.nodeEnv})`);
  console.log(`🌐 Allowed Frontend Origin: ${config.frontendUrl}`);
  console.log(`🩺 Health check available at: http://localhost:${config.port}/api/v1/health`);
  console.log('================================================================');
});

// Graceful Shutdown
const handleShutdown = async (signal: string) => {
  console.log(`\n[${signal}] Received. Shutting down BOOKKARO backend gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('Database connections cleanly terminated.');
    } catch (err) {
      console.error('Error during database disconnect:', err);
    }
    process.exit(0);
  });

  // Force close if graceful shutdown hangs
  setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
