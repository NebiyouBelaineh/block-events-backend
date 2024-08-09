import { disconnectDB } from './db';

(async () => {
  try {
    await disconnectDB();
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
})();
