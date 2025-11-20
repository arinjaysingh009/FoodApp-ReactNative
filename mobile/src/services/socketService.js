import io from 'socket.io-client';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem('token');
      
      this.socket = io(API_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.connected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.connected = false;
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Order tracking
  subscribeToOrderUpdates(orderId, callback) {
    if (this.socket) {
      this.socket.on(`order:${orderId}:update`, callback);
    }
  }

  unsubscribeFromOrderUpdates(orderId) {
    if (this.socket) {
      this.socket.off(`order:${orderId}:update`);
    }
  }

  // General notifications
  subscribeToNotifications(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  unsubscribeFromNotifications() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }

  // Emit events
  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    }
  }

  // Listen to custom events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();
