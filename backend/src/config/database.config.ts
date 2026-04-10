import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  // Production (Supabase) & local-with-url
  url: process.env.DATABASE_URL,
  // Local dev fallback (host-based)
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  name: process.env.DB_NAME || 'gestion_entreprises',
}));
