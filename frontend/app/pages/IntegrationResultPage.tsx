import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPainAssessment, createPainAssessmentWithImage } from '../../utils/painAssessments.utils';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFE',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 40,
        alignItems: 'center',
    },
    
    // Header Section
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(26, 26, 26, 0.7)',
        textAlign: 'center',
    },
    
    // Results Card
    resultsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        marginBottom: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    resultsCardGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#4CAF50',
    },
    painLevelSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    painLevelLabel: {
        fontSize: 16,
        color: 'rgba(26, 26, 26, 0.7)',
        marginBottom: 8,
        textAlign: 'center',
    },
    painLevelValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        textAlign: 'center',
        marginBottom: 16,
    },
    recommendationsSection: {
        width: '100%',
    },
    recommendationsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
        textAlign: 'center',
    },
    recommendationsText: {
        fontSize: 14,
        color: 'rgba(26, 26, 26, 0.8)',
        textAlign: 'center',
        lineHeight: 22,
    },
    // Action Buttons
    actionButtonsContainer: {
        width: '100%',
        marginBottom: 24,
    },
    primaryButton: {
        backgroundColor: '#2196F3',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginBottom: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    secondaryButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
    },
    secondaryButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    
    // Disclaimer
    disclaimerCard: {
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 193, 7, 0.3)',
        width: '100%',
        marginBottom: 24,
    },
    disclaimerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F57C00',
        marginBottom: 8,
        textAlign: 'center',
    },
    disclaimerText: {
        fontSize: 12,
        color: 'rgba(26, 26, 26, 0.7)',
        textAlign: 'center',
        lineHeight: 16,
    },
});

interface IntegrationResultPageProps {
    onSecondOpinion?: () => void;
    onHome?: () => void;
    onSecondOpinionAppointment?: () => void;
    onSave?: () => void;
    onTakeAnotherPicture?: () => void;
    petType?: string;
    severityLevel?: string;
    painLevel?: string;
}

export default function IntegrationResultPage({ 
    onSecondOpinion, 
    onHome, 
    onSecondOpinionAppointment,
    onSave,
    onTakeAnotherPicture,
    petType = 'cat', 
    severityLevel = 'Unknown',
    painLevel 
}: IntegrationResultPageProps) {
    
    // Use painLevel if provided, otherwise fall back to severityLevel
    const currentPainLevel = painLevel || severityLevel;

    // Normalize various backend/result strings to a consistent 6-level BEAP set
    const normalizePainLevel = (level: string): string => {
        if (!level) return 'Unknown';
        const normalized = String(level).trim();
        // Prefer numeric level if present
        if (/^level\s*0/i.test(normalized)) return 'Level 0 (No Pain)';
        if (/^level\s*1/i.test(normalized)) return 'Level 1 (Mild Pain)';
        if (/^level\s*2/i.test(normalized)) return 'Level 2 (Moderate Pain)';
        if (/^level\s*3/i.test(normalized)) return 'Level 3 (Moderate to Severe Pain)';
        if (/^level\s*4/i.test(normalized)) return 'Level 4 (Severe Pain)';
        if (/^level\s*5/i.test(normalized)) return 'Level 5 (Worst Pain Possible)';

        // Handle plain labels
        const lower = normalized.toLowerCase();
        if (lower.includes('no pain')) return 'Level 0 (No Pain)';
        if (lower.includes('mild')) return 'Level 1 (Mild Pain)';
        if (lower.includes('moderate to severe')) return 'Level 3 (Moderate to Severe Pain)';
        if (lower.includes('moderate')) return 'Level 2 (Moderate Pain)';
        if (lower.includes('worst')) return 'Level 5 (Worst Pain Possible)';
        if (lower.includes('severe')) return 'Level 4 (Severe Pain)';
        if (lower.includes('unknown') || lower.includes('not recognize') || lower.includes('not recognized')) return 'Unknown';
        return 'Unknown';
    };

    const normalizedPainLevel = normalizePainLevel(currentPainLevel);

    // Resolve pet type preference from local assessment data if present
    const [displayPetType, setDisplayPetType] = useState<string>(petType);
    React.useEffect(() => {
        (async () => {
            try {
                const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
                if (assessmentDataString) {
                    const assessmentData = JSON.parse(assessmentDataString);
                    const storedType = String(assessmentData?.pet_type || '').toLowerCase();
                    if (storedType === 'cat' || storedType === 'dog') {
                        setDisplayPetType(storedType);
                    }
                }
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    // Define a function to get recommendations based on the pain level
    const getRecommendations = (level: string, type: string) => {
        const petName = type === 'cat' ? 'cat' : 'dog';
        const petPronoun = type === 'cat' ? 'its' : 'their';
        
        if (level === 'Level 0 (No Pain)' || level === 'Level 0' || level === 'No Pain') {
            return `Your ${petName} appears to be in good health. Continue to monitor ${petPronoun} behavior and well-being.`;
        } else if (level === 'Level 1 (Mild Pain)' || level === 'Level 1' || level === 'Mild Pain') {
            return `Your ${petName} may be experiencing mild pain. Monitor closely for changes in behavior or appetite. Consider consulting with a veterinarian if symptoms persist.`;
        } else if (level === 'Level 2 (Moderate Pain)' || level === 'Level 2' || level === 'Moderate Pain') {
            return `Your ${petName} is experiencing moderate pain. Please schedule a veterinary appointment soon to address the underlying cause and ensure your pet's comfort.`;
        } else if (level === 'Level 3 (Moderate to Severe Pain)' || level === 'Level 3' || level === 'Moderate to Severe Pain') {
            return `Your ${petName} is experiencing moderate to severe pain. Seek prompt veterinary attention to manage pain and evaluate potential causes.`;
        } else if (level === 'Level 4 (Severe Pain)' || level === 'Level 4' || level === 'Severe Pain') {
            return `Your ${petName} is experiencing severe pain. Immediate veterinary attention is strongly recommended to ensure comfort and address serious concerns.`;
        } else if (level === 'Level 5 (Worst Pain Possible)' || level === 'Level 5' || level === 'Worst Pain Possible') {
            return `Your ${petName} may be in the worst pain possible. Seek emergency veterinary care immediately.`;
        } else if (level === 'Not recognize' || level === 'Not Recognized' || level === 'Unknown') {
            return `The image could not be properly analyzed. Please ensure your ${petName}'s face is clearly visible and well-lit. Try taking another photo following the guidelines above.`;
        }
        return "Pain assessment result is unknown. Please try again or consult a professional.";
    };

    // Define a function to get the image source based on pain level
    const getResultImage = (level: string) => {
        if (level === 'Level 0 (No Pain)' || level === 'Level 0' || level === 'No Pain') {
            return require('../../assets/images/NoPain.png'); // No pain image
        } else if (level === 'Level 1 (Mild Pain)' || level === 'Level 1' || level === 'Mild Pain') {
            return require('../../assets/images/MildPain.png'); // Mild pain image
        } else if (level === 'Level 2 (Moderate Pain)' || level === 'Level 2' || level === 'Moderate Pain') {
            return require('../../assets/images/ModeratePain.png'); // Moderate pain image
        } else if (level === 'Level 3 (Moderate to Severe Pain)' || level === 'Level 3' || level === 'Moderate to Severe Pain') {
            return require('../../assets/images/ModeratePain.png'); // Reuse moderate image
        } else if (level === 'Level 4 (Severe Pain)' || level === 'Level 4' || level === 'Severe Pain') {
            return require('../../assets/images/ModeratePain.png'); // Reuse moderate image
        } else if (level === 'Level 5 (Worst Pain Possible)' || level === 'Level 5' || level === 'Worst Pain Possible') {
            return require('../../assets/images/ModeratePain.png'); // Reuse moderate image
        } else if (level === 'Not recognize' || level === 'Not Recognized' || level === 'Unknown') {
            return require('../../assets/images/NoPain.png'); // Default to no pain image for unknown
        }
        return require('../../assets/images/NoPain.png'); // Default to no pain image
    };

    const recommendations = getRecommendations(normalizedPainLevel, displayPetType);
    const resultImageSource = getResultImage(normalizedPainLevel);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveChoice, setSaveChoice] = useState<'yes' | 'no' | null>(null);
    const [petRegistered, setPetRegistered] = useState<'yes' | 'no' | null>(null);

    // Read pet_registered flag from storage
    React.useEffect(() => {
        (async () => {
            try {
                const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
                if (assessmentDataString) {
                    const assessmentData = JSON.parse(assessmentDataString);
                    if (assessmentData && assessmentData.pet_registered) {
                        setPetRegistered(assessmentData.pet_registered);
                    }
                }
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    const handleSaveChoice = async (choice: 'yes' | 'no') => {
        setSaveChoice(choice);
        
        if (choice === 'yes') {
            setIsSaving(true);
            try {
                // Get the assessment data from local storage
                const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
                if (assessmentDataString) {
                    const assessmentData = JSON.parse(assessmentDataString);
                    
                    // Debug: Log what's in the assessment data
                    console.log('=== ASSESSMENT DATA FROM STORAGE ===');
                    console.log('Full assessment data:', assessmentData);
                    console.log('Basic answers:', assessmentData.basic_answers);
                    console.log('Assessment answers:', assessmentData.assessment_answers);
                    
                    // Update the assessment data with final results
                    assessmentData.recommendations = recommendations;
                    assessmentData.pain_level = currentPainLevel;
                    
                    // Check if image_url is already a server URL or local file path
                    let result;
                    const imageUrlString = String(assessmentData?.image_url || '');
                    if (imageUrlString.startsWith('file://')) {
                        // Local file path - upload via multipart endpoint
                        result = await createPainAssessmentWithImage(assessmentData, imageUrlString);
                    } else if (imageUrlString.startsWith('/uploads/')) {
                        // Already a server URL - create via JSON
                        result = await createPainAssessment(assessmentData);
                    } else {
                        // No image or unknown format - create via JSON
                        result = await createPainAssessment(assessmentData);
                    }

                    if (result.success) {
                        console.log('Assessment created and saved successfully');
                        setIsSaved(true);
                        // Clear the assessment data from storage
                        await AsyncStorage.removeItem('currentAssessmentData');
                        
                        // Don't navigate automatically - stay on the same page
                        // The user can choose to navigate using the back arrow or second opinion button
                    } else {
                        console.error('Failed to save assessment:', result.message);
                        Alert.alert('Error', 'Failed to save assessment. Please try again.');
                        setSaveChoice(null);
                    }
                } else {
                    Alert.alert('Error', 'No assessment data found to save.');
                    setSaveChoice(null);
                }
            } catch (error) {
                console.error('Error saving assessment:', error);
                Alert.alert('Error', 'Failed to save assessment. Please try again.');
                setSaveChoice(null);
            } finally {
                setIsSaving(false);
            }
        } else if (choice === 'no') {
            // Don't save, just clear the data and go home
            try {
                await AsyncStorage.removeItem('currentAssessmentData');
                console.log('Assessment discarded, navigating to home');
                if (onHome) {
                    onHome();
                }
            } catch (error) {
                console.error('Error clearing assessment data:', error);
                if (onHome) {
                    onHome();
                }
            }
        }
    };

    const handleHome = async () => {
        try {
            // Clear the assessment data from storage without saving
            await AsyncStorage.removeItem('currentAssessmentData');
            console.log('Assessment discarded, navigating to home');
        } catch (error) {
            console.error('Error clearing assessment data:', error);
        }
        
        if (onHome) {
            onHome();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <View style={styles.successIcon}>
                            <MaterialIcons name="check" size={40} color="#FFFFFF" />
                        </View>
                        <Text style={styles.headerTitle}>Assessment Complete</Text>
                        <Text style={styles.headerSubtitle}>AI analysis finished successfully</Text>
                    </View>

                    {/* Results Card */}
                    <View style={styles.resultsCard}>
                        <View style={styles.painLevelSection}>
                            <Text style={styles.painLevelLabel}>Your {displayPetType}'s assessed pain level:</Text>
                            <Text style={styles.painLevelValue}>{normalizedPainLevel}</Text>
                        </View>
                        
                        <View style={styles.recommendationsSection}>
                            <Text style={styles.recommendationsTitle}>Recommendations</Text>
                            <Text style={styles.recommendationsText}>{recommendations}</Text>
                        </View>
                        
                        <View style={styles.resultsCardGradient} />
                    </View>

                    {/* Disclaimer */}
                    <View style={styles.disclaimerCard}>
                        <Text style={styles.disclaimerTitle}>⚠️ Medical Disclaimer</Text>
                        <Text style={styles.disclaimerText}>
                            This AI assessment is for informational purposes only and should not replace professional veterinary consultation. 
                            Always consult with a qualified veterinarian for accurate diagnosis and treatment recommendations.
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity 
                            style={styles.primaryButton} 
                            onPress={onTakeAnotherPicture || (() => onHome?.())}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.primaryButtonText}>Take Another Picture</Text>
                        </TouchableOpacity>
                        
                        {petRegistered === 'yes' && !isSaved && (
                            <TouchableOpacity 
                                style={styles.secondaryButton} 
                                onPress={() => handleSaveChoice('yes')}
                                disabled={isSaving}
                                activeOpacity={0.9}
                            >
                                {isSaving ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <ActivityIndicator size="small" color="#6B7280" style={{ marginRight: 8 }} />
                                        <Text style={styles.secondaryButtonText}>Saving Assessment...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.secondaryButtonText}>Save Assessment</Text>
                                )}
                            </TouchableOpacity>
                        )}
                        
                        {(petRegistered === 'yes' && isSaved) || petRegistered !== 'yes' ? (
                            <TouchableOpacity 
                                style={styles.secondaryButton} 
                                onPress={onSecondOpinionAppointment || onSecondOpinion}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.secondaryButtonText}>Get Second Opinion</Text>
                            </TouchableOpacity>
                        ) : null}
                        
                        <TouchableOpacity 
                            style={styles.secondaryButton} 
                            onPress={handleHome}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.secondaryButtonText}>Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 