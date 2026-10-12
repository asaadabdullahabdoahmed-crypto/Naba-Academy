/**
 * CORS Origin Validator Factory
 * Evaluates incoming browser Origin headers against configured allowlist.
 */
export function createCorsOriginValidator(allowedOrigins: string[]) {
  return (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    // Non-browser clients (curl, mobile apps, server-to-server) do not provide an Origin header
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy violation: Origin '${origin}' is not in allowlist`), false);
  };
}
