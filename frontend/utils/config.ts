// API Configuration
// Prefer an env override via EXPO_PUBLIC_API_BASE_URL.
// Otherwise, auto-detect sensible defaults for emulator/simulator during development.
import { Platform } from 'react-native';

function getDefaultDevBaseUrl(): string {
  // Try different URLs based on the platform
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api';
  } else {
    // For mobile device/Expo, use the computer's network IP address
    return 'http://192.168.1.13:8000/api';
  }
}

const ENV_BASE = (typeof process !== 'undefined' && (process as any)?.env?.EXPO_PUBLIC_API_BASE_URL) || '';

export const API_BASE_URL = __DEV__
  ? (ENV_BASE || getDefaultDevBaseUrl())
  : (ENV_BASE || 'https://your-production-api.com/api');

// Helper function to get the correct API URL
export function getApiUrl(): string {
  return API_BASE_URL;
}