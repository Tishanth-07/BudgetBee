import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
<<<<<<< HEAD
    PORT: z.coerce.number().default(3000),
=======
    PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
>>>>>>> feature/backend/categories-api
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string().default('supersecret'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
}

export const config = parsed.data;
