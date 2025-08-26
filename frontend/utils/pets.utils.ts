// Pet management utilities for API communication
import { getApiUrl } from './config';
import { getAuthToken } from './auth.utils';

const API_BASE_URL = getApiUrl();

export type PetData = {
  id: number;
  pet_id: string;
  name: string;
  owner_name: string;
  species: string;
  date_of_birth?: string;
  color?: string;
  breed?: string;
  gender?: string;
  reproductive_status?: string;
  photo_url?: string;
  created_at?: string;
};

export type PetCreateData = {
  pet_id: string;
  name: string;
  species: string;
  date_of_birth?: string;
  color?: string;
  breed?: string;
  gender?: string;
  reproductive_status?: string;
};

export type PetResult = {
  success: boolean;
  message?: string;
  data?: PetData | PetData[];
};

// Get all pets for the current user
export async function getPets(): Promise<PetResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(`${API_BASE_URL}/pets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = 'Failed to fetch pets';
      try {
        const errorData = JSON.parse(errorText);
        message = errorData.detail || message;
      } catch (_) {
        if (errorText) message = errorText;
      }
      return { success: false, message };
    }

    const pets = await response.json();
    return { success: true, data: pets };
  } catch (error) {
    console.error('Get pets error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

// Create a new pet
export async function createPet(petData: PetCreateData): Promise<PetResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(`${API_BASE_URL}/pets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(petData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = 'Failed to create pet';
      try {
        const errorData = JSON.parse(errorText);
        message = errorData.detail || message;
      } catch (_) {
        if (errorText) message = errorText;
      }
      return { success: false, message };
    }

    const pet = await response.json();
    return { success: true, data: pet, message: "Pet created successfully!" };
  } catch (error) {
    console.error('Create pet error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

// Get pet by ID
export async function getPetById(petId: number): Promise<PetResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = 'Failed to fetch pet';
      try {
        const errorData = JSON.parse(errorText);
        message = errorData.detail || message;
      } catch (_) {
        if (errorText) message = errorText;
      }
      return { success: false, message };
    }

    const pet = await response.json();
    return { success: true, data: pet };
  } catch (error) {
    console.error('Get pet by ID error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

// Update pet by ID
export async function updatePet(petId: number, petData: Partial<PetData>): Promise<PetResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(petData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = 'Failed to update pet';
      try {
        const errorData = JSON.parse(errorText);
        message = errorData.detail || message;
      } catch (_) {
        if (errorText) message = errorText;
      }
      return { success: false, message };
    }

    const pet = await response.json();
    return { success: true, data: pet, message: "Pet updated successfully!" };
  } catch (error) {
    console.error('Update pet error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}