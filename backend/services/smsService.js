const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  // Send OTP SMS
  async sendOTP(phoneNumber, otp, userName = '') {
    try {
      const message = `Your FoodApp OTP is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      console.log('OTP SMS sent:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Error sending OTP SMS:', error);
      throw error;
    }
  }

  // Send welcome SMS
  async sendWelcomeSMS(phoneNumber, userName) {
    try {
      const message = `Welcome to FoodApp, ${userName}! Your account has been successfully created. Start ordering your favorite food now!`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      console.log('Welcome SMS sent:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Error sending welcome SMS:', error);
      throw error;
    }
  }

  // Send order confirmation SMS
  async sendOrderConfirmation(phoneNumber, userName, orderId) {
    try {
      const message = `Hi ${userName}, your order #${orderId} has been confirmed! Track your order in the FoodApp.`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      console.log('Order confirmation SMS sent:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Error sending order confirmation SMS:', error);
      throw error;
    }
  }

  // Send order status update SMS
  async sendOrderStatusUpdate(phoneNumber, userName, orderId, status) {
    try {
      const statusMessages = {
        preparing: `Hi ${userName}, your order #${orderId} is being prepared.`,
        ready: `Hi ${userName}, your order #${orderId} is ready for pickup!`,
        on_the_way: `Hi ${userName}, your order #${orderId} is on the way. It will arrive soon!`,
        delivered: `Hi ${userName}, your order #${orderId} has been delivered. Enjoy your meal!`,
        cancelled: `Hi ${userName}, your order #${orderId} has been cancelled.`
      };

      const message = statusMessages[status] || `Your order #${orderId} status has been updated to ${status}.`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      console.log('Order status SMS sent:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Error sending order status SMS:', error);
      throw error;
    }
  }

  // Send delivery partner assignment SMS
  async sendDeliveryPartnerAssignment(phoneNumber, orderId, deliveryPartnerName) {
    try {
      const message = `Your order #${orderId} has been assigned to ${deliveryPartnerName}. They will deliver your food soon!`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      console.log('Delivery partner assignment SMS sent:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Error sending delivery partner SMS:', error);
      throw error;
    }
  }

  // Send password reset SMS
  async sendPasswordResetSMS(phoneNumber, otp) {
    try {
      const message = `Your FoodApp password reset OTP is: ${otp}. This code will expire in 10 minutes. If you didn't request this, please ignore.`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      console.log('Password reset SMS sent:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Error sending password reset SMS:', error);
      throw error;
    }
  }

  // Format phone number to E.164 format
  formatPhoneNumber(phoneNumber, countryCode = '+1') {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If number doesn't start with country code, add it
    if (!cleaned.startsWith(countryCode.replace('+', ''))) {
      return `${countryCode}${cleaned}`;
    }
    
    return `+${cleaned}`;
  }

  // Verify phone number format
  isValidPhoneNumber(phoneNumber) {
    // Basic validation - must be at least 10 digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 10;
  }

  // Check Twilio service status
  async verifyConnection() {
    try {
      // Test by fetching account details
      await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      console.log('SMS service is ready');
      return true;
    } catch (error) {
      console.error('SMS service connection error:', error);
      return false;
    }
  }
}

module.exports = new SMSService();
