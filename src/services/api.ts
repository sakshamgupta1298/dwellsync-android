import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Debug logging system
let debugLogs: string[] = [];
let debugLogCallback: ((logs: string[]) => void) | null = null;

export const setDebugLogCallback = (callback: (logs: string[]) => void) => {
  debugLogCallback = callback;
};

const addDebugLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `${timestamp}: ${message}`;
  console.log(logMessage);
  debugLogs = [...debugLogs, logMessage];
  if (debugLogCallback) {
    debugLogCallback(debugLogs);
  }
};

export const getDebugLogs = () => debugLogs;

export const API_BASE_URL = 'http://liveinsync.in:5000/api'; // Replace with your actual backend URL
// const API_URL = 'http://10.0.2.2:8081/api';
// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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
      addDebugLog(`Attempting login for tenant ID: ${tenantId}`);
      const response = await api.post('/login', { tenant_id: tenantId, password });
      addDebugLog(`Login response received: ${JSON.stringify(response.data)}`);
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        const savedToken = await AsyncStorage.getItem('token');
        addDebugLog(`Token saved in AsyncStorage: ${savedToken ? 'Success' : 'Failed'}`);
      }
      return response.data;
    } catch (error) {
      addDebugLog(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  },

  registerOwner: async (name: string, email: string, password: string) => {
    try {
      addDebugLog(`Attempting owner registration for email: ${email}`);
      const response = await api.post('/register_owner', { name, email, password });
      addDebugLog(`Owner registration response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      addDebugLog(`Owner registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  },

  registerTenant: async (name: string, rentAmount: number) => {
    try {
      addDebugLog(`Attempting tenant registration for name: ${name}`);
      const response = await api.post('/register_tenant', { name, rent_amount: rentAmount });
      addDebugLog(`Tenant registration response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      addDebugLog(`Tenant registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  },

  logout: async () => {
    try {
      addDebugLog('Attempting logout');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      addDebugLog('Logout successful');
    } catch (error) {
      addDebugLog(`Logout error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      addDebugLog(`Sending forgot password request for email: ${email}`);
      const response = await api.post('/auth/forgot-password', { email });
      addDebugLog(`Forgot password response: ${JSON.stringify(response.data)}`);
      
      const result = {
        ...response.data,
        otp: response.data.otp
      };
      addDebugLog(`OTP returned by API: ${result.otp}`);
      return result;
    } catch (error) {
      addDebugLog(`Forgot password error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  },

  verifyOTP: async (email: string, otp: string) => {
    try {
      addDebugLog(`Making OTP verification request for email: ${email}`);
      const response = await api.post('/auth/verify-otp', { email, otp });
      addDebugLog(`OTP verification response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      addDebugLog(`OTP verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (axios.isAxiosError(error)) {
        addDebugLog(`API Error details: ${JSON.stringify({
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        })}`);
      }
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