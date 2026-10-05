module.exports = {
  secret: process.env.JWT_SECRET || 'super_secret_jwt_key_university_seminar_2026_secure',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
