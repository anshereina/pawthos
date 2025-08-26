import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MedicalVisitDetailsModal from '../modals/MedicalVisitDetailsModal';

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f7f7f7' 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#fff',
        elevation: 2,
    },
    backButton: {
        marginRight: 16,
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#000' 
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    petInfoSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
    },
    petInfoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#045b26',
        marginBottom: 16,
    },
    petInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    petInfoLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#045b26',
        width: 100,
    },
    petInfoValue: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#e0ffe6',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        color: '#045b26',
        fontSize: 9,
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    lastHeaderCell: {
        borderRightWidth: 0,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        minHeight: 50,
    },
    tableCell: {
        flex: 1,
        fontSize: 10,
        color: '#000',
        textAlign: 'center',
        paddingHorizontal: 4,
        borderRightWidth: 1,
        borderRightColor: '#f0f0f0',
    },
    lastCell: {
        borderRightWidth: 0,
    },
    clickableText: {
        color: '#045b26',
        textDecorationLine: 'underline',
        fontWeight: '500',
        fontSize: 10,
        textAlign: 'center',
    },
    emptyRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        minHeight: 50,
    },
    emptyCell: {
        flex: 1,
        height: 20,
        backgroundColor: '#f9f9f9',
        marginHorizontal: 2,
        borderRadius: 4,
        borderRightWidth: 1,
        borderRightColor: '#f0f0f0',
    },
    lastEmptyCell: {
        borderRightWidth: 0,
    },
});

export default function PetMedRecordsPage({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
    const [modalVisible, setModalVisible] = useState(false);

    const medicalVisitData = {
        petName: 'Maku',
        age: '3 years old',
        dateOfBirth: 'Sept. 08, 2021',
        gender: 'Male',
        reasonForVisit: 'Regular health checkup and consultation',
        dateVisited: '07/12/2025',
        dateOfNextVisit: '08/12/2025',
        proceduresDone: 'Physical examination, temperature check, heart rate monitoring',
        findings: 'Pet is in good health. No abnormalities detected.',
        recommendations: 'Continue regular exercise and maintain current diet. Schedule follow-up in 1 month.',
        medications: 'None prescribed',
        vaccineUsed: '5in1 (Anti-Parvo) vaccine administered'
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => onNavigate('Pet Details')}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.title}>Medical Records</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Pet Information Section */}
                <View style={styles.petInfoSection}>
                    <Text style={styles.petInfoTitle}>Pet Information</Text>
                    
                    <View style={styles.petInfoItem}>
                        <Text style={styles.petInfoLabel}>Name:</Text>
                        <Text style={styles.petInfoValue}>Maku</Text>
                    </View>
                    <View style={styles.petInfoItem}>
                        <Text style={styles.petInfoLabel}>Age:</Text>
                        <Text style={styles.petInfoValue}>2 years</Text>
                    </View>
                    <View style={styles.petInfoItem}>
                        <Text style={styles.petInfoLabel}>Date of Birth:</Text>
                        <Text style={styles.petInfoValue}>07/15/2023</Text>
                    </View>
                    <View style={styles.petInfoItem}>
                        <Text style={styles.petInfoLabel}>Gender:</Text>
                        <Text style={styles.petInfoValue}>Male</Text>
                    </View>
                </View>

                {/* Medical Records Table */}
                <View style={styles.tableContainer}>                    
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.headerCell}>Reason for Visit</Text>
                        <Text style={styles.headerCell}>Date Visited</Text>
                        <Text style={styles.headerCell}>Next Visit</Text>
                        <Text style={[styles.headerCell, styles.lastHeaderCell]}>Description</Text>
                    </View>

                    {/* Sample Medical Record */}
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>Consultation</Text>
                        <Text style={styles.tableCell}>07/12/2025</Text>
                        <Text style={styles.tableCell}>08/12/2025</Text>
                        <View style={[styles.tableCell, styles.lastCell]}>
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <Text style={styles.clickableText}>See Details</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </ScrollView>

            {/* Medical Visit Details Modal */}
            <MedicalVisitDetailsModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                medicalVisitData={medicalVisitData}
            />
        </SafeAreaView>
    );
} 