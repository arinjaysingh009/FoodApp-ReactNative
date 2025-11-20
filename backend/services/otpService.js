const crypto = require('crypto');
const pool = require('../config/database');

class OTPService {
  // Generate a 6-digit OTP
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Store OTP in database with expiration
  async storeOTP(userId, otp, type = 'email') {
    try {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
      
      const query = `
        INSERT INTO otps (user_id, otp, type, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      
      const result = await pool.query(query, [userId, otp, type, expiresAt]);
      return result.rows[0];
    } catch (error) {
      console.error('Error storing OTP:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(userId, otp, type = 'email') {
    try {
      const query = `
        SELECT * FROM otps
        WHERE user_id = $1
        AND otp = $2
        AND type = $3
        AND expires_at > NOW()
        AND used = false
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [userId, otp, type]);
      
      if (result.rows.length === 0) {
        return { valid: false, message: 'Invalid or expired OTP' };
      }

      // Mark OTP as used
      await this.markOTPAsUsed(result.rows[0].id);
      
      return { valid: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  // Mark OTP as used
  async markOTPAsUsed(otpId) {
    try {
      const query = `
        UPDATE otps
        SET used = true
        WHERE id = $1
      `;
      
      await pool.query(query, [otpId]);
    } catch (error) {
      console.error('Error marking OTP as used:', error);
      throw error;
    }
  }

  // Clean expired OTPs (for maintenance)
  async cleanExpiredOTPs() {
    try {
      const query = `
        DELETE FROM otps
        WHERE expires_at < NOW()
        OR (used = true AND created_at < NOW() - INTERVAL '24 hours')
      `;
      
      const result = await pool.query(query);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning expired OTPs:', error);
      throw error;
    }
  }

  // Verify OTP by email or phone
  async verifyOTPByContact(contact, otp, type = 'email') {
    try {
      let query;
      if (type === 'email') {
        query = `
          SELECT o.* FROM otps o
          JOIN users u ON o.user_id = u.id
          WHERE u.email = $1
          AND o.otp = $2
          AND o.type = $3
          AND o.expires_at > NOW()
          AND o.used = false
          ORDER BY o.created_at DESC
          LIMIT 1
        `;
      } else {
        query = `
          SELECT o.* FROM otps o
          JOIN users u ON o.user_id = u.id
          WHERE u.phone = $1
          AND o.otp = $2
          AND o.type = $3
          AND o.expires_at > NOW()
          AND o.used = false
          ORDER BY o.created_at DESC
          LIMIT 1
        `;
      }
      
      const result = await pool.query(query, [contact, otp, type]);
      
      if (result.rows.length === 0) {
        return { valid: false, message: 'Invalid or expired OTP' };
      }

      // Mark OTP as used
      await this.markOTPAsUsed(result.rows[0].id);
      
      return { 
        valid: true, 
        message: 'OTP verified successfully',
        userId: result.rows[0].user_id
      };
    } catch (error) {
      console.error('Error verifying OTP by contact:', error);
      throw error;
    }
  }

  // Check if user can request new OTP (rate limiting)
  async canRequestOTP(userId, type = 'email') {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM otps
        WHERE user_id = $1
        AND type = $2
        AND created_at > NOW() - INTERVAL '1 hour'
      `;
      
      const result = await pool.query(query, [userId, type]);
      const count = parseInt(result.rows[0].count);
      
      // Allow maximum 5 OTP requests per hour
      return {
        canRequest: count < 5,
        attemptsLeft: Math.max(0, 5 - count)
      };
    } catch (error) {
      console.error('Error checking OTP rate limit:', error);
      throw error;
    }
  }
}

module.exports = new OTPService();
