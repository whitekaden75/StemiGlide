import pg from "pg";
import { AppError } from "../utils/AppError.js";
import { env } from "./env.js";

const { Pool } = pg;

const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
  ssl: env.dbSsl ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: env.dbConnectionTimeoutMs,
});

export const db = {
  async query(...args) {
    const queryPromise = pool.query(...args);
    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          new AppError(
            `Database request timed out after ${env.dbConnectionTimeoutMs}ms.`,
            504,
          ),
        );
      }, env.dbConnectionTimeoutMs);
    });

    try {
      return await Promise.race([queryPromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
