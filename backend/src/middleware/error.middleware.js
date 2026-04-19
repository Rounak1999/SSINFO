function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Route not found' });
}

function errorHandler(error, _req, res, _next) {
  if (error.isJoi) {
    res.status(400).json({
      message: 'Validation failed',
      details: error.details.map((item) => item.message),
    });
    return;
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      message: 'Duplicate email or phone detected.',
      details: error.errors?.map((item) => item.message) || null,
    });
    return;
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || 'Internal server error',
    details: error.details || null,
  });
}

module.exports = { notFoundHandler, errorHandler };
