import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPainAssessment } from '../../utils/painAssessments.utils';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Light white background
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    content: {
        width: '100%',
        maxWidth: 400, // Limit maximum width for better centering
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    // Circular Icon Container
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -20, // Creates overlap with the results card
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        zIndex: 10, // Ensures it appears above the results card
    },
    // Results Card
    resultsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 32,
        paddingTop: 52, 
        width: '90%',
        alignItems: 'center',
        marginBottom: 32,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    resultText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#d37f52', // Terracotta color for result
        marginBottom: 20,
        textAlign: 'center',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#e0e0e0',
        marginBottom: 20,
    },
    recommendationsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    recommendationsText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    // Button Container
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 20,
        marginTop: 'auto',
        paddingBottom: 20,
    },
    // Save Question Container
    saveQuestionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    // Save Question Text
    saveQuestionText: {
        color: '#045b26',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Yes/No Text Buttons
    yesNoTextButton: {
        color: '#D37F52',
        fontSize: 18,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    yesNoTextButtonDisabled: {
        color: '#ccc',
    },

    // Second Opinion Button
    secondOpinionButton: {
        backgroundColor: '#D37F52', // Terracotta orange
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        width: '100%',
        maxWidth: 240,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 8,
    },
    secondOpinionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    // Note Text
    noteText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 16,
        paddingHorizontal: 20,
        lineHeight: 16,
    },
});

interface IntegrationResultPageProps {
    onSecondOpinion?: () => void;
    onHome?: () => void;
    onSecondOpinionAppointment?: () => void;
    onSave?: () => void;
    petType?: string;
    severityLevel?: string;
    painLevel?: string;
}

export default function IntegrationResultPage({ 
    onSecondOpinion, 
    onHome, 
    onSecondOpinionAppointment,
    onSave,
    petType = 'cat', 
    severityLevel = 'Unknown',
    painLevel 
}: IntegrationResultPageProps) {
    
    // Use painLevel if provided, otherwise fall back to severityLevel
    const currentPainLevel = painLevel || severityLevel;

    // Define a function to get recommendations based on the pain level
    const getRecommendations = (level: string, type: string) => {
        const petName = type === 'cat' ? 'cat' : 'dog';
        const petPronoun = type === 'cat' ? 'its' : 'their';
        
        if (level === 'Level 0 (No Pain)' || level === 'Level 0' || level === 'No Pain') {
            return `Your ${petName} appears to be in good health. Continue to monitor ${petPronoun} behavior and well-being.`;
        } else if (level === 'Level 1 (Mild Pain)' || level === 'Level 1' || level === 'Mild Pain') {
            return `Your ${petName} may be experiencing mild pain. Monitor closely for changes in behavior or appetite. Consider consulting with a veterinarian if symptoms persist.`;
        } else if (level === 'Level 2 (Moderate/Severe Pain)' || level === 'Level 2' || level === 'Moderate Pain' || level === 'Severe Pain') {
            return `Your ${petName} is likely experiencing moderate to severe pain. It is highly recommended to seek immediate veterinary attention to ensure your pet's comfort and health.`;
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
        } else if (level === 'Level 2 (Moderate/Severe Pain)' || level === 'Level 2' || level === 'Moderate Pain' || level === 'Severe Pain') {
            return require('../../assets/images/ModeratePain.png'); // Moderate pain image
        } else if (level === 'Not recognize' || level === 'Not Recognized' || level === 'Unknown') {
            return require('../../assets/images/NoPain.png'); // Default to no pain image for unknown
        }
        return require('../../assets/images/NoPain.png'); // Default to no pain image
    };

    const recommendations = getRecommendations(currentPainLevel, petType);
    const resultImageSource = getResultImage(currentPainLevel);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveChoice, setSaveChoice] = useState<'yes' | 'no' | null>(null);

    const handleSaveChoice = async (choice: 'yes' | 'no') => {
        setSaveChoice(choice);
        
        if (choice === 'yes') {
            setIsSaving(true);
            try {
                // Get the assessment data from local storage
                const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
                if (assessmentDataString) {
                    const assessmentData = JSON.parse(assessmentDataString);
                    
                    // Update the assessment data with final results
                    assessmentData.recommendations = recommendations;
                    assessmentData.pain_level = currentPainLevel;
                    
                    // Create the assessment in the database
                    const result = await createPainAssessment(assessmentData);

                    if (result.success) {
                        console.log('Assessment created and saved successfully');
                        setIsSaved(true);
                        // Clear the assessment data from storage
                        await AsyncStorage.removeItem('currentAssessmentData');
                        
                        // Navigate to Pain Assessment page after successful save
                        if (onSave) {
                            onSave();
                        }
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
            <View style={styles.content}>
                {/* Circular Image */}
                <View style={styles.iconContainer}>
                    <Image
                        source={resultImageSource}
                        style={{ width: 60, height: 60, resizeMode: 'contain' }}
                    />
                </View>

                {/* Results Card */}
                <View style={styles.resultsCard}>
                    <Text style={styles.resultTitle}>
                        Your {petType}'s pain level is:
                    </Text>
                    <Text style={styles.resultText}>
                        {currentPainLevel}
                    </Text>
                    
                    <View style={styles.divider} />
                    
                    <Text style={styles.recommendationsTitle}>
                        Recommendations
                    </Text>
                    <Text style={styles.recommendationsText}>
                        {recommendations}
                    </Text>
                </View>

                {/* Call-to-Action Buttons */}
                <View style={styles.buttonContainer}>
                    <View style={styles.saveQuestionContainer}>
                        <Text style={styles.saveQuestionText}>Save Assessment?</Text>
                        
                        <TouchableOpacity
                            onPress={() => handleSaveChoice('yes')}
                            disabled={saveChoice === 'yes' || isSaving}
                        >
                            {isSaving ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color="#D37F52" style={{ marginRight: 4 }} />
                                    <Text style={[styles.yesNoTextButton, styles.yesNoTextButtonDisabled]}>Saving...</Text>
                                </View>
                            ) : (
                                <Text style={[
                                    styles.yesNoTextButton,
                                    (saveChoice === 'yes' || isSaving) && styles.yesNoTextButtonDisabled
                                ]}>Yes</Text>
                            )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => handleSaveChoice('no')}
                            disabled={saveChoice === 'no' || isSaving}
                        >
                            <Text style={[
                                styles.yesNoTextButton,
                                saveChoice === 'no' && styles.yesNoTextButtonDisabled
                            ]}>No</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity
                        style={styles.secondOpinionButton}
                        onPress={onSecondOpinionAppointment}
                    >
                        <Text style={styles.secondOpinionButtonText}>Second Opinion</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.noteText}>
                        Note: You'll need to schedule your pet to clinic appointment once you have a second opinion.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
} 