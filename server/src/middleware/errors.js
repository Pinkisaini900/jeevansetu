export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Express 4 does not catch async errors, so every async handler is wrapped.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Consistent envelope: { ok: true, data } or { ok: false, error }
export const send = (res, data, status = 200) => res.status(status).json({ ok: true, data });

export const notFound = (req, res) =>
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ ok: false, error: err.message });
  console.error(err);
  return res.status(500).json({ ok: false, error: 'Something went wrong on the server.' });
}

export function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const msg = result.error.issues.map((i) => `${i.path.join('.') || 'input'}: ${i.message}`).join('; ');
    throw new HttpError(400, msg);
  }
  return result.data;
}
