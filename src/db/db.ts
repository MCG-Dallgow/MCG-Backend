import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2';
import dotenv from 'dotenv';

import * as schema from './schema'

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

const db = drizzle(connection, { schema, mode: 'default' });

export default db;
