import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
    petInfoRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    petInfoColumn: {
        flex: 1,
    },
    petInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    petInfoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#045b26',
        width: 80,
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
    tableTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#045b26',
        padding: 20,
        paddingBottom: 16,
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

export default function PetVacCardPage({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
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
                <Text style={styles.title}>Pet VacCard</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Pet Information Section */}
                <View style={styles.petInfoSection}>
                    <Text style={styles.petInfoTitle}>Pet Information</Text>
                    
                    <View style={styles.petInfoRow}>
                        <View style={styles.petInfoColumn}>
                            <View style={styles.petInfoItem}>
                                <Text style={styles.petInfoLabel}>Name:</Text>
                                <Text style={styles.petInfoValue}>Maku</Text>
                            </View>
                            <View style={styles.petInfoItem}>
                                <Text style={styles.petInfoLabel}>Age:</Text>
                                <Text style={styles.petInfoValue}>2 years</Text>
                            </View>
                        </View>
                        <View style={styles.petInfoColumn}>
                            <View style={styles.petInfoItem}>
                                <Text style={styles.petInfoLabel}>Date of Birth:</Text>
                                <Text style={styles.petInfoValue}>07/15/2023</Text>
                            </View>
                            <View style={styles.petInfoItem}>
                                <Text style={styles.petInfoLabel}>Gender:</Text>
                                <Text style={styles.petInfoValue}>Male</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Vaccination Record Table */}
                <View style={styles.tableContainer}>                    
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.headerCell}>Date of Vaccination</Text>
                        <Text style={styles.headerCell}>Vaccine Used</Text>
                        <Text style={styles.headerCell}>Lot No./ Batch No.</Text>
                        <Text style={styles.headerCell}>Date of next Vaccination</Text>
                        <Text style={styles.headerCell}>Vet. Lic No. PTR</Text>
                    </View>

                    {/* Sample Vaccination Record */}
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>01/15/2024</Text>
                        <Text style={styles.tableCell}>Rabies Vaccine</Text>
                        <Text style={styles.tableCell}>RB-2024-001</Text>
                        <Text style={styles.tableCell}>01/15/2025</Text>
                        <Text style={[styles.tableCell, styles.lastCell]}>PTR-12345</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>03/20/2024</Text>
                        <Text style={styles.tableCell}>DHPP Vaccine</Text>
                        <Text style={styles.tableCell}>DHPP-2024-002</Text>
                        <Text style={styles.tableCell}>03/20/2025</Text>
                        <Text style={[styles.tableCell, styles.lastCell]}>PTR-12345</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 