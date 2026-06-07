import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma", // Path to your Prisma schema
    datasource: {
        url: env("DATABASE_URL"), // Reads the URL from your .env file
    },
});