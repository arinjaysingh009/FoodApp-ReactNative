const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Send OTP email
  async sendOTPEmail(email, otp, userName = '') {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'FoodApp'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your OTP for Verification',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">OTP Verification</h2>
            <p>Hello ${userName},</p>
            <p>Your One-Time Password (OTP) for verification is:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #666;">This OTP will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this OTP, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('OTP email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw error;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email, userName) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'FoodApp'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to FoodApp!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to FoodApp!</h2>
            <p>Hello ${userName},</p>
            <p>Thank you for signing up! We're excited to have you on board.</p>
            <p>You can now:</p>
            <ul>
              <li>Browse our delicious menu</li>
              <li>Place orders easily</li>
              <li>Track your orders in real-time</li>
              <li>Rate your favorite dishes</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(email, userName, orderDetails) {
    try {
      const itemsList = orderDetails.items.map(item => 
        `<li>${item.name} x ${item.quantity} - $${item.price}</li>`
      ).join('');

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'FoodApp'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Order Confirmation - Order #${orderDetails.orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Order Confirmed!</h2>
            <p>Hello ${userName},</p>
            <p>Your order has been confirmed and is being prepared.</p>
            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0;">
              <h3>Order #${orderDetails.orderId}</h3>
              <p><strong>Status:</strong> ${orderDetails.status}</p>
              <p><strong>Items:</strong></p>
              <ul>${itemsList}</ul>
              <p><strong>Total:</strong> $${orderDetails.total}</p>
              <p><strong>Delivery Address:</strong><br/>${orderDetails.address}</p>
            </div>
            <p>You can track your order status in the app.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, userName, resetToken) {
    try {
      const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'FoodApp'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666;">This link will expire in 1 hour.</p>
            <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Send order status update email
  async sendOrderStatusUpdate(email, userName, orderId, newStatus) {
    try {
      const statusMessages = {
        preparing: 'Your order is being prepared',
        ready: 'Your order is ready for pickup',
        on_the_way: 'Your order is on the way',
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled'
      };

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'FoodApp'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Order Update - Order #${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Order Status Update</h2>
            <p>Hello ${userName},</p>
            <p>${statusMessages[newStatus] || 'Your order status has been updated'}.</p>
            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0;">
              <p><strong>Order #${orderId}</strong></p>
              <p><strong>Status:</strong> ${newStatus.toUpperCase()}</p>
            </div>
            <p>You can track your order in the app for more details.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Order status update email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending order status email:', error);
      throw error;
    }
  }

  // Verify transporter connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('Email service connection error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
