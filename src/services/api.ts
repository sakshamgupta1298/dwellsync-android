import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.7:3000/api'; // Replace with your actual backend URL
// const API_URL = 'http://10.0.2.2:8081/api';
// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (tenantId: string, password: string) => {
    try {
      const response = await api.post('/login', { tenant_id: tenantId, password });
      console.log("response:",response)
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        // Debug log to confirm token is saved
        const savedToken = await AsyncStorage.getItem('token');
        console.log('Token saved in AsyncStorage:', savedToken);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registerOwner: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/register_owner', { name, email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registerTenant: async (name: string, rentAmount: number) => {
    try {
      const response = await api.post('/register_tenant', { name, rent_amount: rentAmount });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      throw error;
    }
  },
};

// Tenant Services
export const tenantService = {
  getDashboard: async () => {
    try {
      const response = await api.get('/tenant/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  submitMeterReading: async (readingValue: number, meterType: 'electricity' | 'water', imageUri: string) => {
    try {
      const formData = new FormData();
      formData.append('reading_value', readingValue.toString());
      formData.append('meter_type', meterType);
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'meter_reading.jpg',
      });

      const response = await api.post('/submit_reading', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPayment: async (paymentMethod: 'card' | 'bank_transfer' | 'cash') => {
    try {
      const response = await api.post('/create_payment', { payment_method: paymentMethod });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Owner Services
export const ownerService = {
  getDashboard: async () => {
    try {
      const response = await api.get('/owner/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTenants: async () => {
    try {
      const response = await api.get('/owner/tenants');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateElectricityRate: async (rate: number) => {
    try {
      const response = await api.post('/owner/electricity_rate', { rate });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  registerTenant: async (
    name: string,
    rentAmount: number,
    initialElectricity: number,
    initialWater: number
  ) => {
    try {
      const response = await api.post('/register_tenant', {
        name,
        rent_amount: rentAmount,
        initial_electricity_reading: initialElectricity,
        initial_water_reading: initialWater,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getElectricityRate: async () => {
    try {
      const response = await api.get('/owner/electricity_rate');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getWaterBill: async () => {
    try {
      const response = await api.get('/owner/water_bill');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getPayments: async () => {
    try {
      const response = await api.get('/owner/payments');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getMeterReadings: async () => {
    try {
      const response = await api.get('/owner/meter_readings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateWaterBill: async (totalAmount: number) => {
    try {
      const response = await api.post('/owner/water_bill', { total_amount: totalAmount });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  acceptPayment: async (paymentId: number) => {
    try {
      const response = await api.post(`/owner/payments/${paymentId}/accept`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  rejectPayment: async (paymentId: number) => {
    try {
      const response = await api.post(`/owner/payments/${paymentId}/reject`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteTenant: async (tenantId: number) => {
    try {
      const response = await api.delete(`/owner/tenants/${tenantId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api; 