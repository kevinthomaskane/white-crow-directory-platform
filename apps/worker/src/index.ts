import dotenv from 'dotenv';

// Load .env.local first, then fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config(); // This will load .env if .env.local doesn't have the variable
