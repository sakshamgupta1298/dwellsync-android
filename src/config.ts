export const config = {
  // Development
  development: {
    apiUrl: 'http://10.0.2.2:5000/api',
  },
  // Production
  production: {
    apiUrl: 'http://liveinsync.in:5000/api', // Replace with your DigitalOcean droplet IP or domain
  },
};

// Get the current environment
const ENV = __DEV__ ? 'development' : 'production';

// Export the current configuration
export default config[ENV]; 