export const config = {
  // Development
  development: {
    apiUrl: 'http://10.0.2.2:5000/api',
  },
  // Production
  production: {
    apiUrl: 'http://192.168.1.7:3000/api', // Replace with your computer's local IP address
  },
};

// Get the current environment
const ENV = __DEV__ ? 'development' : 'production';

// Export the current configuration
export default config[ENV]; 