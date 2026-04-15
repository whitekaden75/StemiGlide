import { getDatabaseStatus } from "../services/healthService.js";

export async function getHealth(_request, response, next) {
  try {
    const database = await getDatabaseStatus();

    response.json({
      ok: true,
      service: "stemi-glide-backend",
      database,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}
