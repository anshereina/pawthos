import { API_BASE_URL } from './config';
import { getAuthToken } from './auth.utils';

export interface PainAssessmentRecord {
    id: number;
    pet_id: number;
    user_id: number;
    pet_name: string;
    pet_type: string;
    pain_level: string;
    assessment_date: string;
    recommendations?: string;
    image_url?: string;
    created_at: string;
}

export interface PainAssessmentCreate {
    pet_id: number;
    pet_name: string;
    pet_type: string;
    pain_level: string;
    assessment_date: string;
    recommendations?: string;
    image_url?: string;
}

export interface PainAssessmentResponse {
    success: boolean;
    data?: PainAssessmentRecord[];
    message?: string;
}

export interface SinglePainAssessmentResponse {
    success: boolean;
    data?: PainAssessmentRecord;
    message?: string;
}

/**
 * Get all pain assessments for the current user
 */
export const getPainAssessments = async (): Promise<PainAssessmentResponse> => {
    try {
        const token = await getAuthToken();
        if (!token) {
            return {
                success: false,
                message: 'No authentication token found'
            };
        }

        const response = await fetch(`${API_BASE_URL}/pain-assessments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: errorData.detail || 'Failed to fetch pain assessments'
            };
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('Get pain assessments error:', error);
        return {
            success: false,
            message: 'Network error while fetching pain assessments'
        };
    }
};

/**
 * Create a new pain assessment
 */
export const createPainAssessment = async (assessmentData: PainAssessmentCreate): Promise<SinglePainAssessmentResponse> => {
    try {
        const token = await getAuthToken();
        if (!token) {
            return {
                success: false,
                message: 'No authentication token found'
            };
        }

        const response = await fetch(`${API_BASE_URL}/pain-assessments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assessmentData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: errorData.detail || 'Failed to create pain assessment'
            };
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('Create pain assessment error:', error);
        return {
            success: false,
            message: 'Network error while creating pain assessment'
        };
    }
};

/**
 * Get a specific pain assessment by ID
 */
export const getPainAssessmentById = async (assessmentId: number): Promise<SinglePainAssessmentResponse> => {
    try {
        const token = await getAuthToken();
        if (!token) {
            return {
                success: false,
                message: 'No authentication token found'
            };
        }

        const response = await fetch(`${API_BASE_URL}/pain-assessments/${assessmentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: errorData.detail || 'Failed to fetch pain assessment'
            };
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('Get pain assessment error:', error);
        return {
            success: false,
            message: 'Network error while fetching pain assessment'
        };
    }
};

/**
 * Update a pain assessment
 */
export const updatePainAssessment = async (assessmentId: number, updateData: Partial<PainAssessmentCreate>): Promise<SinglePainAssessmentResponse> => {
    try {
        const token = await getAuthToken();
        if (!token) {
            return {
                success: false,
                message: 'No authentication token found'
            };
        }

        const response = await fetch(`${API_BASE_URL}/pain-assessments/${assessmentId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: errorData.detail || 'Failed to update pain assessment'
            };
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('Update pain assessment error:', error);
        return {
            success: false,
            message: 'Network error while updating pain assessment'
        };
    }
};

/**
 * Delete a pain assessment
 */
export const deletePainAssessment = async (assessmentId: number): Promise<{ success: boolean; message?: string }> => {
    try {
        const token = await getAuthToken();
        if (!token) {
            return {
                success: false,
                message: 'No authentication token found'
            };
        }

        const response = await fetch(`${API_BASE_URL}/pain-assessments/${assessmentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: errorData.detail || 'Failed to delete pain assessment'
            };
        }

        return {
            success: true,
            message: 'Pain assessment deleted successfully'
        };

    } catch (error) {
        console.error('Delete pain assessment error:', error);
        return {
            success: false,
            message: 'Network error while deleting pain assessment'
        };
    }
};

/**
 * Format date for display
 */
export const formatAssessmentDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    } catch (error) {
        return dateString;
    }
};

/**
 * Get pain level color based on level
 */
export const getPainLevelColor = (painLevel: string): string => {
    if (painLevel.includes('Level 0') || painLevel.includes('No Pain')) {
        return '#4CAF50'; // Green
    } else if (painLevel.includes('Level 1') || painLevel.includes('Mild Pain')) {
        return '#FF9800'; // Orange
    } else if (painLevel.includes('Level 2') || painLevel.includes('Moderate') || painLevel.includes('Severe')) {
        return '#F44336'; // Red
    }
    return '#9e9e9e'; // Gray (default)
};
