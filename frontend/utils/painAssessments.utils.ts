import { API_BASE_URL } from './config';
import { getAuthToken } from './auth.utils';

export interface PainAssessmentRecord {
    id: number;
    pet_id: number;
    user_id: number;
    pet_name: string;
    pet_type: string;
    pain_score?: number;
    pain_level: string;
    assessment_date: string;
    recommendations?: string;
    image_url?: string;
    basic_answers?: string;  // JSON string of basic question answers
    assessment_answers?: string;  // JSON string of detailed assessment answers
    created_at: string;
}

// Note: Frontend Integration flow may pass extended fields (pet_name, pet_type, pain_level, etc.)
// while the backend expects { pet_id, pain_score, notes }.
// Keep a broad type and normalize in createPainAssessment.
export interface PainAssessmentCreate {
    // Backend-required
    pet_id: number;
    pain_score?: number;
    notes?: string;

    // Optional fields from Integration flow
    pet_name?: string;
    pet_type?: string;
    pain_level?: string;
    assessment_date?: string;
    recommendations?: string;
    image_url?: string;
    basic_answers?: string;  // JSON string of basic question answers
    assessment_answers?: string;  // JSON string of detailed assessment answers
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

        // Normalize payload for backend
        const toPainScore = (level?: string): number => {
            const value = (level || '').toLowerCase();
            if (value.includes('level 0') || value.includes('no pain')) return 0;
            if (value.includes('level 1') || value.includes('mild')) return 1;
            if (value.includes('level 2') || value.includes('moderate') || value.includes('severe')) return 2;
            return 0;
        };

        const normalizedPayload = {
            pet_id: assessmentData.pet_id,
            pet_name: assessmentData.pet_name,
            pet_type: assessmentData.pet_type,
            image_url: assessmentData.image_url,
            pain_score: typeof assessmentData.pain_score === 'number'
                ? assessmentData.pain_score
                : toPainScore(assessmentData.pain_level),
            pain_level: assessmentData.pain_level,  // Include legacy field for backend compatibility
            notes: assessmentData.notes ||
                [
                    assessmentData.recommendations ? `Recommendations: ${assessmentData.recommendations}` : undefined,
                ].filter(Boolean).join('\n') || undefined,
            basic_answers: assessmentData.basic_answers,  // Include question answers
            assessment_answers: assessmentData.assessment_answers,  // Include detailed answers
        };

        // Debug: Log what's being sent to backend
        console.log('=== PAYLOAD BEING SENT TO BACKEND ===');
        console.log('Normalized payload:', normalizedPayload);
        console.log('Basic answers in payload:', normalizedPayload.basic_answers);
        console.log('Assessment answers in payload:', normalizedPayload.assessment_answers);

        const response = await fetch(`${API_BASE_URL}/pain-assessments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(normalizedPayload),
        });

        if (!response.ok) {
            let message = 'Failed to create pain assessment';
            try {
                const errorData = await response.json();
                message = errorData?.detail || message;
            } catch (e) {
                const text = await response.text();
                message = text || message;
            }
            return { success: false, message };
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
    const level = (painLevel || '').toLowerCase();
    if (level.includes('level 0') || level.includes('no pain')) {
        return '#4CAF50'; // Green
    } else if (level.includes('level 1') || level.includes('moderate')) {
        return '#FF9800'; // Orange
    } else if (level.includes('level 2') || level.includes('severe')) {
        return '#F44336'; // Red
    }
    return '#9e9e9e'; // Gray (default)
};

/**
 * Map numeric pain score to human-readable label
 */
export const getPainLevelLabelFromScore = (painScore?: number): string => {
    if (painScore === 0) return 'Level 0 - No Pain';
    if (painScore === 1) return 'Level 1 - Moderate Pain';
    if (painScore === 2) return 'Level 2 - Severe Pain';
    return '';
};

/**
 * Derive display label, preferring pain_level string; fallback to pain_score mapping
 */
export const derivePainLevelLabel = (args: { pain_level?: string; pain_score?: number }): string => {
    return args.pain_level && args.pain_level.length > 0
        ? args.pain_level
        : getPainLevelLabelFromScore(args.pain_score);
};
