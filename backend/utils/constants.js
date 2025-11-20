// Application-wide constants

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  DELIVERY_PARTNER: 'delivery_partner'
};

// Order statuses
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  ON_THE_WAY: 'on_the_way',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Payment statuses
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Payment methods
const PAYMENT_METHODS = {
  CARD: 'card',
  CASH: 'cash',
  WALLET: 'wallet'
};

// OTP types
const OTP_TYPES = {
  EMAIL: 'email',
  SMS: 'sms'
};

// Food categories
const FOOD_CATEGORIES = {
  APPETIZERS: 'appetizers',
  MAIN_COURSE: 'main_course',
  DESSERTS: 'desserts',
  BEVERAGES: 'beverages',
  SNACKS: 'snacks'
};

// Notification types
const NOTIFICATION_TYPES = {
  ORDER_CREATED: 'order_created',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_STATUS_UPDATED: 'order_status_updated',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  NEW_FOOD_ITEM: 'new_food_item'
};

// Rating types
const RATING_TYPES = {
  FOOD: 'food',
  DELIVERY: 'delivery',
  OVERALL: 'overall'
};

// File upload constants
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp', 'gif']
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// JWT expiry times
const JWT_EXPIRY = {
  ACCESS_TOKEN: '7d', // 7 days
  REFRESH_TOKEN: '30d', // 30 days
  RESET_TOKEN: '1h' // 1 hour
};

// OTP settings
const OTP_SETTINGS = {
  EXPIRY_MINUTES: 10,
  LENGTH: 6,
  MAX_ATTEMPTS_PER_HOUR: 5
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Error messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  OTP_EXPIRED: 'OTP has expired',
  OTP_INVALID: 'Invalid OTP',
  PAYMENT_FAILED: 'Payment processing failed',
  ORDER_NOT_FOUND: 'Order not found',
  FOOD_NOT_AVAILABLE: 'Food item not available'
};

// Success messages
const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_RESET: 'Password reset successful',
  OTP_SENT: 'OTP sent successfully',
  ORDER_PLACED: 'Order placed successfully',
  ORDER_UPDATED: 'Order updated successfully',
  PAYMENT_SUCCESS: 'Payment completed successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
};

// Regular expressions
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/
};

// Database table names
const TABLES = {
  USERS: 'users',
  FOOD_ITEMS: 'food_items',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  CART: 'cart',
  CART_ITEMS: 'cart_items',
  PAYMENTS: 'payments',
  RATINGS: 'ratings',
  OTPS: 'otps',
  NOTIFICATIONS: 'notifications'
};

module.exports = {
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  OTP_TYPES,
  FOOD_CATEGORIES,
  NOTIFICATION_TYPES,
  RATING_TYPES,
  FILE_UPLOAD,
  PAGINATION,
  JWT_EXPIRY,
  OTP_SETTINGS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX_PATTERNS,
  TABLES
};
