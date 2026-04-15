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

export function getRequestIp(request, response) {
  const forwardedFor = request.headers["x-forwarded-for"];

  response.json({
    ok: true,
    ip: request.ip,
    forwardedFor: Array.isArray(forwardedFor)
      ? forwardedFor.join(", ")
      : (forwardedFor ?? ""),
    remoteAddress: request.socket.remoteAddress ?? "",
    timestamp: new Date().toISOString(),
  });
}
