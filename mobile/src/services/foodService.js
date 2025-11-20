import api from './api';

const foodService = {
  getAllFood: async () => {
    const response = await api.get('/food');
    return response.data;
  },

  getFoodById: async (id) => {
    const response = await api.get(`/food/${id}`);
    return response.data;
  },

  searchFood: async (query) => {
    const response = await api.get('/food/search', { params: { q: query } });
    return response.data;
  },

  getFoodByCategory: async (category) => {
    const response = await api.get('/food/category', { params: { category } });
    return response.data;
  },

  rateFood: async (foodId, rating, comment) => {
    const response = await api.post(`/food/${foodId}/rate`, { rating, comment });
    return response.data;
  },

  // Admin operations
  createFood: async (formData) => {
    const response = await api.post('/food', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateFood: async (id, formData) => {
    const response = await api.put(`/food/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  toggleFoodAvailability: async (id) => {
    const response = await api.patch(`/food/${id}/toggle`);
    return response.data;
  },

  deleteFood: async (id) => {
    const response = await api.delete(`/food/${id}`);
    return response.data;
  },
};

export default foodService;
