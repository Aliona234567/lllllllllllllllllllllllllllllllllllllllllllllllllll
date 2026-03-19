import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

export const migrationClient = postgres(connectionString, { max: 1 });

function postgres(connectionString: string, p0?: { max: number; }) {
    throw new Error('Function not implemented.');
}
