import { database } from "../repositories/database.js";

export async function getDatabaseStatus() {
  return database.getDatabaseStatus();
}
