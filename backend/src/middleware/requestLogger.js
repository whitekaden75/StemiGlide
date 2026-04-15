export function requestLogger(request, response, next) {
  const startedAt = Date.now();

  console.log(
    `[request:start] ${request.method} ${request.originalUrl} ip=${request.ip}`,
  );

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;

    console.log(
      `[request:end] ${request.method} ${request.originalUrl} status=${response.statusCode} durationMs=${durationMs}`,
    );
  });

  next();
}
