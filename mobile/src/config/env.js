// Development environment variables
const dev = {
  API_URL: 'http://localhost:5001/api',
};

// Production environment variables
const prod = {
  API_URL: 'https://your-production-api.com/api',
};

// Select the environment based on __DEV__ flag
const config = __DEV__ ? dev : prod;

export default config; 