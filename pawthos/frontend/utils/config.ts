// API Configuration
// For development, you'll need to replace 'localhost' with your computer's IP address
// To find your IP: 
// - Windows: Run 'ipconfig' in Command Prompt, look for IPv4 Address
// - Mac/Linux: Run 'ifconfig' in Terminal, look for inet address

// Example: If your computer's IP is 192.168.1.100, use:
// export const API_BASE_URL = 'http://192.168.1.100:3000/api';

// For now, using localhost (you'll need to change this)
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.8:8001/api'  // Python FastAPI server on port 8001
  : 'https://your-production-api.com/api';

// Helper function to get the correct API URL
export function getApiUrl(): string {
  return API_BASE_URL;
}