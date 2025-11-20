const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/authMiddleware');

// Helper: Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper: Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, phone, password, fullName, role = 'user' } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and full name'
      });
    }

    await client.query('BEGIN');

    // Check if user already exists
    const userCheck = await client.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (userCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const result = await client.query(
      `INSERT INTO users (email, phone, password_hash, role, full_name) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, full_name`,
      [email, phone, passwordHash, role, fullName]
    );

    const user = result.rows[0];

    // Generate OTP for email verification
    const emailOTP = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await client.query(
      `INSERT INTO otp_verification (user_id, otp_code, otp_type, contact, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, emailOTP, 'email', email, otpExpiry]
    );

    await client.query('COMMIT');

    // TODO: Send OTP via email
    console.log(`Email OTP for ${email}: ${emailOTP}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        userId: user.id,
        email: user.email,
        requiresVerification: true
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  } finally {
    client.release();
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for email/phone
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { contact, otpCode, otpType } = req.body;

    if (!contact || !otpCode || !otpType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide contact, OTP code, and OTP type'
      });
    }

    // Find OTP record
    const otpResult = await pool.query(
      `SELECT * FROM otp_verification 
       WHERE contact = $1 AND otp_code = $2 AND otp_type = $3 
       AND is_verified = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [contact, otpCode, otpType]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const otpRecord = otpResult.rows[0];

    // Mark OTP as verified
    await pool.query(
      'UPDATE otp_verification SET is_verified = true WHERE id = $1',
      [otpRecord.id]
    );

    // Update user verification status
    if (otpType === 'email') {
      await pool.query(
        'UPDATE users SET email_verified = true WHERE id = $1',
        [otpRecord.user_id]
      );
    } else if (otpType === 'phone') {
      await pool.query(
        'UPDATE users SET phone_verified = true WHERE id = $1',
        [otpRecord.user_id]
      );
    }

    // Get user details
    const userResult = await pool.query(
      'SELECT id, email, role, full_name FROM users WHERE id = $1',
      [otpRecord.user_id]
    );

    const user = userResult.rows[0];
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          emailVerified: user.email_verified,
          phoneVerified: user.phone_verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset OTP
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If the email exists, a password reset OTP has been sent'
      });
    }

    const user = result.rows[0];

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `INSERT INTO otp_verification (user_id, otp_code, otp_type, contact, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, otp, 'password_reset', email, otpExpiry]
    );

    // TODO: Send OTP via email
    console.log(`Password reset OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: 'If the email exists, a password reset OTP has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and new password'
      });
    }

    await client.query('BEGIN');

    // Verify OTP
    const otpResult = await client.query(
      `SELECT * FROM otp_verification 
       WHERE contact = $1 AND otp_code = $2 AND otp_type = 'password_reset'
       AND is_verified = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otpCode]
    );

    if (otpResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const otpRecord = otpResult.rows[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, otpRecord.user_id]
    );

    // Mark OTP as verified
    await client.query(
      'UPDATE otp_verification SET is_verified = true WHERE id = $1',
      [otpRecord.id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  } finally {
    client.release();
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
