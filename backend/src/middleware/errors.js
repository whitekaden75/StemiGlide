export function notFoundHandler(request, response) {
  response.status(404).json({
    error: `Route not found: ${request.method} ${request.originalUrl}`,
  });
}

export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode ?? 500;

  response.status(statusCode).json({
    error: error.message ?? "Internal server error.",
  });
}
