// API Configuration
// For development: use localhost (works for simulator and local backend)
// For production: update with your AWS Lambda API Gateway URL
export const API_BASE_URL = __DEV__
  ? "http://localhost:4000"  // Development: localhost
  : "https://YOUR-LAMBDA-API-GATEWAY-URL.amazonaws.com"; // Production: AWS Lambda
