// src/db/prisma.ts
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// This connection string must be exactly the same as in your .env file
const connectionString = `${process.env.DATABASE_URL}`;

// Create a new adapter instance, passing in the connection string
const adapter = new PrismaPg({
    connectionString,
});

// Instantiate PrismaClient, passing the adapter as an option
export const prisma = new PrismaClient({ adapter });