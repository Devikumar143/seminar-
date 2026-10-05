const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const jwtConfig = require('../config/jwt');

// Helper to sign JWT
function signToken(userId) {
  return jwt.sign({ userId }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
}

// 1. Student Registration
async function register(req, res, next) {
  try {
    const {
      name,
      student_id,
      email,
      phone,
      department,
      year,
      password,
      confirm_password,
    } = req.body;

    // Field validations
    if (!name || !student_id || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, Student ID, Email, and Password are required fields.',
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirm password do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check duplicate email
    const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.',
      });
    }

    // Check duplicate student_id
    const studentIdCheck = await db.query('SELECT id FROM users WHERE student_id = $1', [student_id.trim().toUpperCase()]);
    if (studentIdCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this Student ID / Roll Number is already registered.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const insertRes = await db.query(
      `INSERT INTO users (name, email, student_id, phone, department, year, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'student')
       RETURNING id, name, email, student_id, phone, department, year, role, profile_photo, created_at`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        student_id.trim().toUpperCase(),
        phone ? phone.trim() : null,
        department ? department.trim() : null,
        year ? year.trim() : null,
        passwordHash,
      ]
    );

    const user = insertRes.rows[0];
    const token = signToken(user.id);

    // Create welcome notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'info')`,
      [
        user.id,
        'Welcome to Joy University Seminar Portal',
        'Your student account has been created. Explore upcoming seminars and register for your first session!',
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the seminar portal.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
}

// 2. Student & Universal Login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const result = await db.query(
      'SELECT id, name, email, student_id, phone, department, year, password_hash, role, profile_photo, created_at FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    delete user.password_hash;
    const token = signToken(user.id);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
}

// 3. Dedicated Admin Login
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Admin email and password are required.',
      });
    }

    const result = await db.query(
      'SELECT id, name, email, student_id, phone, department, year, password_hash, role, profile_photo, created_at FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.',
      });
    }

    const user = result.rows[0];

    if (!['super_admin', 'event_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not possess administrative privileges.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.',
      });
    }

    delete user.password_hash;
    const token = signToken(user.id);

    return res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
}

// 4. Current Logged-in User Profile
async function getMe(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, name, email, student_id, phone, department, year, role, profile_photo, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

// 5. Update Profile
async function updateProfile(req, res, next) {
  try {
    const { name, phone, department, year, profile_photo, student_id } = req.body;

    // Student ID cannot be modified by students themselves
    let targetStudentId = req.user.student_id;
    if (student_id && student_id !== req.user.student_id) {
      if (['super_admin', 'event_admin'].includes(req.user.role)) {
        targetStudentId = student_id.trim().toUpperCase();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Student ID cannot be modified without administrator authorization.',
        });
      }
    }

    const updateRes = await db.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           department = COALESCE($3, department),
           year = COALESCE($4, year),
           profile_photo = COALESCE($5, profile_photo),
           student_id = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, name, email, student_id, phone, department, year, role, profile_photo, created_at, updated_at`,
      [
        name ? name.trim() : null,
        phone ? phone.trim() : null,
        department ? department.trim() : null,
        year ? year.trim() : null,
        profile_photo || null,
        targetStudentId,
        req.user.id,
      ]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updateRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

// 6. Change Password
async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.',
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, userRes.rows[0].password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHash, req.user.id]
    );

    return res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

// 7. Logout
async function logout(req, res) {
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

module.exports = {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  changePassword,
  logout,
};
