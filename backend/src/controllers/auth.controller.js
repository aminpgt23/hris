/**
 * Authentication Controller
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Get user with role info
    const [users] = await db.execute(
      `SELECT u.*, r.name as role_name, r.permissions, e.employee_number 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       LEFT JOIN employees e ON u.employee_id = e.id
       WHERE u.username = ? OR u.email = ?`,
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(403).json({
        success: false,
        message: `Account is locked until ${user.locked_until}`
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      // Increment failed attempts
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
      
      if (newFailedAttempts >= 5) {
        // Lock account for 30 minutes
        const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        await db.execute(
          'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
          [newFailedAttempts, lockedUntil, user.id]
        );
        return res.status(403).json({
          success: false,
          message: 'Account locked due to too many failed attempts. Try again in 30 minutes.'
        });
      }

      await db.execute(
        'UPDATE users SET failed_login_attempts = ? WHERE id = ?',
        [newFailedAttempts, user.id]
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset failed attempts on successful login
    await db.execute(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, roleId: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    // Log audit
    await db.execute(
      'INSERT INTO audit_logs (user_id, action, entity_type, ip_address, request_id) VALUES (?, ?, ?, ?, ?)',
      [user.id, 'LOGIN', 'user', req.ip, req.requestId]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roleName: user.role_name,
          employeeNumber: user.employee_number,
          permissions: (() => {
            if (!user.permissions) return [];
            try {
              return JSON.parse(user.permissions);
            } catch (e) {
              // If permissions is not valid JSON, return as array or empty
              console.warn('Invalid permissions JSON for user:', user.username);
              return Array.isArray(user.permissions) ? user.permissions : [];
            }
          })()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Register new user (Admin only)
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, roleId, employeeId } = req.body;

    if (!username || !email || !password || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and role are required'
      });
    }

    // Check if username or email already exists
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password_hash, role_id, employee_id) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, roleId, employeeId || null]
    );

    // Audit log
    await db.execute(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, request_id) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, 'CREATE', 'user', result.insertId, req.ip, req.requestId]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.insertId,
        username,
        email,
        roleId
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const [users] = await db.execute(
      'SELECT id, username, role_id FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const user = users[0];

    const newToken = jwt.sign(
      { userId: user.id, username: user.username, roleId: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token: newToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // However, we can log the action
    if (req.user) {
      await db.execute(
        'INSERT INTO audit_logs (user_id, action, entity_type, ip_address, request_id) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'LOGOUT', 'user', req.ip, req.requestId]
      );
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Get current user
    const [users] = await db.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.execute(
      'UPDATE users SET password_hash = ?, must_change_password = FALSE WHERE id = ?',
      [newPasswordHash, req.user.id]
    );

    // Audit log
    await db.execute(
      'INSERT INTO audit_logs (user_id, action, entity_type, ip_address, request_id) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'CHANGE_PASSWORD', 'user', req.ip, req.requestId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const [users] = await db.execute(
      `SELECT u.id, u.username, u.email, u.phone, u.is_active, u.last_login_at,
              u.created_at, r.name as role_name, r.display_name as role_display,
              e.employee_number, e.first_name, e.last_name, e.photo_url
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN employees e ON u.employee_id = e.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
};
