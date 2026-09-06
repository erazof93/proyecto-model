import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

// Reutiliza el pool entre hot-reloads en dev para no agotar conexiones.
const pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5434", 10),
    database: process.env.DB_NAME || "proyecto_model",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export default pool;
