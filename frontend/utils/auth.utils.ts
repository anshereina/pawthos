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

// Remember Me functionality
export async function saveRememberMeCredentials(email: string, password: string): Promise<void> {
  try {
    await AsyncStorage.setItem('rememberMe', JSON.stringify({ email, password }));
  } catch (error) {
    console.error('Error saving remember me credentials:', error);
  }
}

export async function getRememberMeCredentials(): Promise<{ email: string; password: string } | null> {
  try {
    const credentials = await AsyncStorage.getItem('rememberMe');
    return credentials ? JSON.parse(credentials) : null;
  } catch (error) {
    console.error('Error getting remember me credentials:', error);
    return null;
  }
}

export async function clearRememberMeCredentials(): Promise<void> {
  try {
    await AsyncStorage.removeItem('rememberMe');
  } catch (error) {
    console.error('Error clearing remember me credentials:', error);
  }
}

// Forgot Password functionality
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { 
        success: true, 
        message: data.message || "Password reset email sent successfully" 
      };
    } else {
      return { 
        success: false, 
        message: data.detail || "Failed to send password reset email" 
      };
    }
  } catch (error) {
    console.error('Password reset request error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token, 
        new_password: newPassword 
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { 
        success: true, 
        message: data.message || "Password reset successfully" 
      };
    } else {
      return { 
        success: false, 
        message: data.detail || "Failed to reset password" 
      };
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok && data.access_token) {
      // Store token in local storage for future requests
      await AsyncStorage.setItem('authToken', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify({
        id: data.id,
        email: data.email,
        name: data.name
      }));
      
      // Handle Remember Me functionality
      if (rememberMe) {
        await saveRememberMeCredentials(email, password);
      } else {
        // Clear saved credentials if "Remember me" is unchecked
        await clearRememberMeCredentials();
      }
      
      return { 
        success: true, 
        token: data.access_token,
        user: {
          id: data.id,
          email: data.email,
          name: data.name
        }
      };
    } else {
      return { 
        success: false, 
        message: data.detail || "Login failed" 
      };
    }
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
  address?: string,
  otpMethod: 'email' | 'sms' = 'email'
): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Align payload keys with backend expectations (FastAPI UserCreate)
      body: JSON.stringify({
        email,
        password,
        name,
        phone_number: phoneNumber,
        address,
      }),
    });

    if (!response.ok) {
      // Try to parse structured error; fallback to text
      const errorText = await response.text();
      try {
        const errJson = JSON.parse(errorText);
        return { success: false, message: errJson.detail || 'Signup failed' };
      } catch (_) {
        return { success: false, message: errorText || 'Signup failed' };
      }
    }

    const user = await response.json();
    return {
      success: true,
      message: 'Registration successful. Please check your email for the OTP code.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
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
  // Don't clear saved credentials on logout - keep them for auto-fill functionality
  // await clearRememberMeCredentials();
}

export async function logoutAndClearCredentials(): Promise<void> {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('user');
  // Clear saved credentials when user explicitly wants to remove them
  await clearRememberMeCredentials();
}

export async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem('authToken');
}

export async function getCurrentUser(): Promise<any> {
  try {
    // First try to get fresh user data from API
    const token = await getAuthToken();
    if (token) {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        // Update stored user data with fresh data including photo_url
        await updateStoredUser(userData);
        return userData;
      }
    }
    
    // Fallback to stored user data if API call fails
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    // Fallback to stored user data
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export async function updateStoredUser(userData: any): Promise<void> {
  await AsyncStorage.setItem('user', JSON.stringify(userData));
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

export async function verifyOTP(
  contactInfo: string,
  otpCode: string,
  otpMethod: 'email' | 'sms' = 'email'
): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactInfo,
        otp_code: otpCode,
        otpMethod: 'email',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errJson = JSON.parse(errorText);
        return { success: false, message: errJson.detail || 'OTP verification failed' };
      } catch (_) {
        return { success: false, message: errorText || 'OTP verification failed' };
      }
    }

    const data = await response.json();
    return { success: true, message: data.message || 'Email verified successfully' };
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

    const response = await fetch(`${API_BASE_URL}/me`, {
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

export const predictPainWithELD = async (imageFile: File, token: string): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_BASE_URL}/predict-eld`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Log ELD-specific information
    if (result.model_type && result.model_type.includes('ELD')) {
      console.log('🎯 ELD Model Results:');
      console.log('- Model Type:', result.model_type);
      console.log('- Landmarks Detected:', result.landmarks_detected);
      console.log('- Expected Landmarks:', result.expected_landmarks);
      console.log('- Features Extracted:', result.features_extracted);
      console.log('- Confidence:', result.confidence);
      console.log('- Pain Level:', result.pain_level);
    }
    
    return result;
  } catch (error) {
    console.error('Error predicting pain with ELD:', error);
    throw error;
  }
};

// Enhanced ELD prediction with detailed logging
export const predictPainWithELDEnhanced = async (imageFile: File, token: string): Promise<any> => {
  try {
    console.log('🚀 Starting ELD (Ensemble Landmark Detector) analysis...');
    const result = await predictPainWithELD(imageFile, token);
    
    // Add additional processing if needed
    if (result.model_type && result.model_type.includes('ELD')) {
      console.log('✅ ELD analysis completed successfully');
      console.log('📊 Analysis Summary:');
      console.log(`   • Pain Level: ${result.pain_level}`);
      console.log(`   • Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   • Landmarks: ${result.landmarks_detected}/${result.expected_landmarks}`);
      console.log(`   • Features: ${result.features_extracted}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ ELD analysis failed:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData: any): Promise<AuthResult> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(`${API_BASE_URL}/update-profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errJson = JSON.parse(errorText);
        return { success: false, message: errJson.detail || 'Profile update failed' };
      } catch (_) {
        return { success: false, message: errorText || 'Profile update failed' };
      }
    }

    const data = await response.json();
    return { success: true, message: 'Profile updated successfully', user: data };
  } catch (error) {
    console.error('Update profile error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
};