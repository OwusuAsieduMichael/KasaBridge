import { AppError } from '../utils/errors.js';
import { config } from '../config/env.js';

function axiosMessage(err) {
  const data = err.response?.data;
  if (typeof data === 'string') return data;
  if (data?.error?.message) return data.error.message;
  if (data?.message) return data.message;
  return err.message;
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err.isAxiosError && err.response) {
    const status = err.response.status >= 400 ? err.response.status : 502;
    return res.status(status).json({
      error: axiosMessage(err),
      upstream: 'openai',
    });
  }

  const statusCode =
    err.statusCode ||
    (err instanceof AppError ? err.statusCode : 500);

  const isClientError = statusCode >= 400 && statusCode < 500;
  const message =
    isClientError || config.nodeEnv === 'development'
      ? err.message
      : 'Internal server error';

  const body = {
    error: message,
    ...(err instanceof AppError && err.details ? { details: err.details } : {}),
  };

  if (config.nodeEnv === 'development' && !isClientError) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
}
