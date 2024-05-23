import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default {
    schema: './src/models/schema.ts',
    out: './drizzle',
    driver: 'mysql2',
    dbCredentials: {
        host: process.env.DB_HOST!,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME!,
    }
} satisfies Config;
