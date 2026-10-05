function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  // PostgreSQL unique violation
  if (err.code === '23505') {
    let message = 'A record with this information already exists.';
    if (err.constraint && err.constraint.includes('email')) {
      message = 'An account with this email address already exists.';
    } else if (err.constraint && err.constraint.includes('student_id')) {
      message = 'An account with this student ID already exists.';
    } else if (err.constraint && err.constraint.includes('unique_user_seminar')) {
      message = 'You are already registered for this seminar.';
    }
    return res.status(409).json({
      success: false,
      message,
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced entity not found.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
