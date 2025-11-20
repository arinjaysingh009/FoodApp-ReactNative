import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      await AsyncStorage.setItem('userToken', response.data.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      await AsyncStorage.setItem('userToken', response.data.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (otpData) => {
    const response = await api.post('/auth/verify-otp', otpData);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (contactInfo) => {
    const response = await api.post('/auth/resend-otp', contactInfo);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (contactInfo) => {
    const response = await api.post('/auth/forgot-password', contactInfo);
    return response.data;
  },

  // Reset password
  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.success) {
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.data));
    }
    return response.data;
  },
};

export default authService;
