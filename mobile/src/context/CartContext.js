import React, { createContext, useState, useEffect, useContext } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
      setCartTotal(0);
      setItemCount(0);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setCart(response.data || []);
      calculateTotal(response.data || []);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    setCartTotal(total);
    setItemCount(count);
  };

  const addToCart = async (foodId, quantity = 1) => {
    try {
      const response = await cartService.addToCart(foodId, quantity);
      await fetchCart();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      const response = await cartService.updateCartItem(cartItemId, quantity);
      await fetchCart();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await cartService.removeFromCart(cartItemId);
      await fetchCart();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const response = await cartService.clearCart();
      setCart([]);
      setCartTotal(0);
      setItemCount(0);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    cart,
    cartTotal,
    itemCount,
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
