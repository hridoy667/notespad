export const validate = (schema, target = 'body') => (req, res, next) => {
  try {
    // Parse the specified target and assign transformed values back to req[target]
    req[target] = schema.parse(req[target]);
    next();
  } catch (error) {
    // Check if it's a ZodError containing issues/errors array
    if (error.issues) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues.map((e) => e.message),
      });
    }

    return res.status(400).json({
      message: 'Validation failed',
      errors: [error.message],
    });
  }
};