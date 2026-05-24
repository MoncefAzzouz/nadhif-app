import { defineConfig } from '@prisma/client/runtime';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
