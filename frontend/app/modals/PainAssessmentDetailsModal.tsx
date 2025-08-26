import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PainAssessmentRecord, formatAssessmentDate, derivePainLevelLabel } from '../../utils/painAssessments.utils';

interface PainAssessmentDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    record: PainAssessmentRecord | null;
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 0,
        maxHeight: '95%',
        width: '90%',
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#045b26',
        flex: 1,
    },
    closeButton: {
        padding: 5,
    },
    modalScrollView: {
        maxHeight: '80%',
    },
    questionContainer: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#045b26',
    },
    questionText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        lineHeight: 20,
    },
    answerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#045b26',
    },
    assessmentInfo: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#A1D998',
        borderRadius: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#045b26',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
    },
    painLevel0: {
        color: '#4CAF50', // Green for no pain
    },
    painLevel1: {
        color: '#FF9800', // Orange for mild pain
    },
    painLevel2: {
        color: '#F44336', // Red for severe pain
    },
});

// Pain assessment questions
const painAssessmentQuestions = [
    'Reluctance to jump onto counters or furniture (does it less)',
    'Difficulty jumping up or down from counters or furniture (falls or seems clumsy)',
    'Difficulty or avoids going up or down stairs',
    'Less playful',
    'Restlessness or difficulty finding a comfortable position',
    'Vocalizing (purring, or hissing) when touched or moving',
    'Decreased appetite',
    'Less desire to interact with people or animals (hiding, resisting being pet, brushed, held, or picked up)',
    'Excessive licking, biting or scratching a body part',
    'Sleeping in an unusual position or unusual location',
    'Unusual aggression when approached or touched (biting, hissing, ears pinned back)',
    'Changes in eye expression (staring, enlarged pupils, vacant look, or squinting)',
    'Stopped using or has difficulty getting in or out of litter box',
    'Stopped grooming completely or certain areas'
];

const getPainLevelColorStyle = (painLevel?: string) => {
    const level = (painLevel || '').toLowerCase();
    if (level.includes('level 0') || level.includes('no pain')) {
        return styles.painLevel0;
    } else if (level.includes('level 1') || level.includes('mild')) {
        return styles.painLevel1;
    } else if (level.includes('level 2') || level.includes('moderate') || level.includes('severe')) {
        return styles.painLevel2;
    }
    return {};
};

export default function PainAssessmentDetailsModal({ visible, onClose, record }: PainAssessmentDetailsModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Pain Assessment Details</Text>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                        {record && (
                            <>
                                {/* Assessment Information */}
                                <View style={styles.assessmentInfo}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Pet Name:</Text>
                                        <Text style={styles.infoValue}>{record.pet_name}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Pet Type:</Text>
                                        <Text style={styles.infoValue}>{record.pet_type}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Pain Level:</Text>
                                        <Text style={[styles.infoValue, getPainLevelColorStyle(record.pain_level)]}>
                                            {derivePainLevelLabel({ pain_level: record.pain_level, pain_score: record.pain_score })}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Assessment Date:</Text>
                                        <Text style={styles.infoValue}>{formatAssessmentDate(record.assessment_date)}</Text>
                                    </View>
                                </View>

                                {/* Questions and Answers */}
                                <Text style={[styles.modalTitle, { marginBottom: 16, fontSize: 18 }]}>Assessment Questions & Answers</Text>
                                
                                {painAssessmentQuestions.map((question, index) => {
                                    // Parse the assessment answers if available
                                    let answer = 'Not answered';
                                    
                                    // Debug logging for first question only
                                    if (index === 0) {
                                        console.log('=== DEBUG ASSESSMENT DATA ===');
                                        console.log('Record:', record);
                                        console.log('Assessment answers:', (record as any).assessment_answers);
                                        console.log('Basic answers:', (record as any).basic_answers);
                                    }
                                    
                                    // Try to get answers from assessment_answers first (like in the React example)
                                    if ((record as any).assessment_answers) {
                                        try {
                                            const answers = JSON.parse((record as any).assessment_answers);
                                            if (Array.isArray(answers) && answers[index] !== undefined) {
                                                answer = answers[index];
                                            } else if (typeof answers === 'object' && answers[question] !== undefined) {
                                                answer = answers[question];
                                            }
                                        } catch (e) {
                                            console.log('Error parsing assessment_answers:', e);
                                        }
                                    }
                                    
                                    // Fallback to basic_answers if assessment_answers didn't work
                                    if (answer === 'Not answered' && (record as any).basic_answers) {
                                        try {
                                            const answers = JSON.parse((record as any).basic_answers);
                                            if (Array.isArray(answers) && answers[index] !== undefined) {
                                                answer = answers[index];
                                            } else if (typeof answers === 'object' && answers[question] !== undefined) {
                                                answer = answers[question];
                                            }
                                        } catch (e) {
                                            console.log('Error parsing basic_answers:', e);
                                        }
                                    }
                                    
                                    // Convert boolean values to Yes/No
                                    if (answer === true || String(answer) === 'true') {
                                        answer = 'Yes';
                                    } else if (answer === false || String(answer) === 'false') {
                                        answer = 'No';
                                    }
                                    
                                    // Debug when answer is found
                                    if (index === 0) {
                                        console.log(`Question ${index + 1} final answer:`, answer);
                                    }
                                    
                                    return (
                                        <View key={index} style={styles.questionContainer}>
                                            <Text style={styles.questionText}>
                                                {index + 1}. {question}
                                            </Text>
                                            <Text style={styles.answerText}>
                                                Answer: {answer}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
