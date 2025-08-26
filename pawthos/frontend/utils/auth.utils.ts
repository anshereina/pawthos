// Authentication utilities for API communication
export type AuthResult = { 
  success: boolean; 
  message?: string; 
  token?: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
};

import { getApiUrl } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = getApiUrl();

export async function login(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      // Store token in local storage for future requests
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

export async function signup(
  email: string,
  password: string,
  name?: string,
  phoneNumber?: string,
  address?: string
): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password, 
        name, 
        phoneNumber, 
        address 
      }),
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      // Store token in local storage for future requests
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Signup error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('user');
}

export async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem('authToken');
}

export async function getCurrentUser(): Promise<any> {
  const userStr = await AsyncStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

export async function verifyOTP(
  email: string,
  otpCode: string
): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        otp_code: otpCode 
      }),
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      // Store token in async storage for future requests
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('OTP verification error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

export async function getUserProfile(): Promise<AuthResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Get profile error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
} 