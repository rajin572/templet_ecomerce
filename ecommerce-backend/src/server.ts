import mongoose from 'mongoose';
import app from './app/app';
import { config } from './app/config';

const PORT = config.port;
const DB_URL = config.databaseUrl;

let server: any;

async function main() {
  try {
    await mongoose.connect(DB_URL);
    console.log('🛢️  Connected to MongoDB successfully');

    server = app.listen(PORT, () => {
      console.log(`🚀 ECommerce API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
}

main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unhandledRejection is detected, shutting down...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.log(`😈 uncaughtException is detected, shutting down...`, err);
  process.exit(1);
});
