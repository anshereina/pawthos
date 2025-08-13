import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePainAssessment } from '../../utils/painAssessments.utils';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#045b26', // Dark green background
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
    // Primary Button (Second Opinion)
    primaryButton: {
        backgroundColor: '#D37F52', 
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 280,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    // Secondary Button (Take Another Picture)
    secondaryButton: {
        backgroundColor: '#b6e2b6', // Light minty green
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        width: '80%',
        maxWidth: 220,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    secondaryButtonText: {
        color: '#045b26', // Dark green text
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});

interface IntegrationResultPageProps {
    onSecondOpinion?: () => void;
    onHome?: () => void;
    onSecondOpinionAppointment?: () => void;
    petType?: string;
    severityLevel?: string;
    painLevel?: string;
}

export default function IntegrationResultPage({ 
    onSecondOpinion, 
    onHome, 
    onSecondOpinionAppointment,
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

    // Finalize the assessment when component mounts
    useEffect(() => {
        const finalizeAssessment = async () => {
            try {
                const assessmentId = await AsyncStorage.getItem('currentAssessmentId');
                if (assessmentId) {
                    // Update the assessment with final recommendations
                    const result = await updatePainAssessment(parseInt(assessmentId), {
                        recommendations: recommendations,
                        pain_level: currentPainLevel
                    });

                    if (result.success) {
                        console.log('Assessment finalized successfully');
                        // Clear the assessment ID from storage
                        await AsyncStorage.removeItem('currentAssessmentId');
                    } else {
                        console.error('Failed to finalize assessment:', result.message);
                    }
                }
            } catch (error) {
                console.error('Error finalizing assessment:', error);
            }
        };

        finalizeAssessment();
    }, [currentPainLevel, recommendations]);

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
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={onSecondOpinionAppointment}
                    >
                        <Text style={styles.primaryButtonText}>Second Opinion</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={onSecondOpinion}
                    >
                        <Text style={styles.secondaryButtonText}>Take another picture</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
} 