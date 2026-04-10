/**
 * { fieldName: (value, body) => error message or null }
 */
export function validateBody(rules) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, ruleFn] of Object.entries(rules)) {
      const msg = ruleFn(req.body?.[field], req.body);
      if (msg) errors.push({ field, message: msg });
    }
    if (errors.length) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    next();
  };
}
