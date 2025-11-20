// Input validation helper functions

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (basic validation)
const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validate password strength
const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Validate required fields
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

// Validate number range
const isInRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Validate string length
const isValidLength = (str, min, max) => {
  if (typeof str !== 'string') return false;
  const length = str.trim().length;
  return length >= min && length <= max;
};

// Validate positive number
const isPositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

// Validate integer
const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

// Validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Validate date format (YYYY-MM-DD)
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Validate credit card number (basic Luhn algorithm)
const isValidCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Sanitize string (remove HTML tags)
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
};

// Validate array
const isValidArray = (arr, minLength = 0, maxLength = Infinity) => {
  return Array.isArray(arr) && arr.length >= minLength && arr.length <= maxLength;
};

// Validate object has required properties
const hasRequiredProps = (obj, requiredProps) => {
  if (typeof obj !== 'object' || obj === null) return false;
  return requiredProps.every(prop => obj.hasOwnProperty(prop));
};

// Validate postal code (US format)
const isValidPostalCode = (code) => {
  const usZipRegex = /^\d{5}(-\d{4})?$/;
  return usZipRegex.test(code);
};

// Validate coordinates
const isValidCoordinates = (lat, lng) => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  
  return !isNaN(latitude) && 
         !isNaN(longitude) && 
         latitude >= -90 && 
         latitude <= 90 && 
         longitude >= -180 && 
         longitude <= 180;
};

// Validate file type
const isValidFileType = (filename, allowedExtensions) => {
  const ext = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(ext);
};

// Validate username (alphanumeric and underscore only)
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  validateRequiredFields,
  isInRange,
  isValidLength,
  isPositiveNumber,
  isInteger,
  isValidUrl,
  isValidDate,
  isValidCreditCard,
  sanitizeString,
  isValidArray,
  hasRequiredProps,
  isValidPostalCode,
  isValidCoordinates,
  isValidFileType,
  isValidUsername
};
