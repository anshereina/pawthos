import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import MedicalVisitDetailsModal from '../modals/MedicalVisitDetailsModal';
import { medicalRecordsAPI, MedicalRecord, MedicalVisitData } from '../../utils/medicalRecords.utils';
import { getPetById } from '../../utils/pets.utils';

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f7f7f7' 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: 'transparent',
        elevation: 0,
    },
    backButton: {
        marginRight: -10,
    },
    title: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#000'
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    exportButton: {
        backgroundColor: '#045b26',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    exportButtonText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 0,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    errorText: {
        fontSize: 16,
        color: '#ff0000',
        textAlign: 'center',
        marginTop: 16,
    },
    retryButton: {
        backgroundColor: '#045b26',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default function PetMedRecordsPage({ onNavigate, petId }: { onNavigate: (page: string, data?: any) => void, petId?: number }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [petInfo, setPetInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [petId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load pet information if petId is provided
            if (petId) {
                const petResult = await getPetById(petId);
                if (petResult.success && petResult.data) {
                    setPetInfo(petResult.data);
                }
                
                // Load medical records for this specific pet
                const records = await medicalRecordsAPI.getMedicalRecordsByPet(petId);
                setMedicalRecords(records);
            } else {
                // Load all medical records for the user's pets
                const records = await medicalRecordsAPI.getMedicalRecords();
                setMedicalRecords(records);
            }
        } catch (err) {
            console.error('Error loading medical records:', err);
            setError('Failed to load medical records. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPress = (record: MedicalRecord) => {
        setSelectedRecord(record);
        setModalVisible(true);
    };

    const handleRetry = () => {
        loadData();
    };

    const handleExportPdf = async () => {
        try {
            const petName = petInfo?.name || 'Pet';
            const headerHtml = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h1 style="margin:0;color:#000;font-size:20px;">Medical Records</h1>
                    <div style="font-size:12px;color:#555;">${new Date().toLocaleString()}</div>
                </div>
            `;

            const petInfoHtml = petInfo ? `
                <div style="border:1px solid #eaeaea;border-radius:8px;padding:12px;margin-bottom:16px;">
                    <h2 style="margin:0 0 8px 0;color:#045b26;font-size:14px;">Pet Information</h2>
                    <table style="width:100%;font-size:12px;color:#333;">
                        <tr><td style="width:120px;font-weight:bold;color:#045b26;">Name:</td><td>${petInfo.name}</td></tr>
                        <tr><td style="width:120px;font-weight:bold;color:#045b26;">Age:</td><td>${petInfo.date_of_birth ? medicalRecordsAPI.calculateAge(petInfo.date_of_birth) : 'Unknown'}</td></tr>
                        <tr><td style="width:120px;font-weight:bold;color:#045b26;">Date of Birth:</td><td>${petInfo.date_of_birth ? medicalRecordsAPI.formatDate(petInfo.date_of_birth) : 'Unknown'}</td></tr>
                        <tr><td style="width:120px;font-weight:bold;color:#045b26;">Gender:</td><td>${petInfo.gender || 'Unknown'}</td></tr>
                    </table>
                </div>
            ` : '';

            const rowsHtml = (medicalRecords || []).map(r => `
                <tr>
                    <td style="padding:8px;border:1px solid #f0f0f0;">${r.reason_for_visit}</td>
                    <td style="padding:8px;border:1px solid #f0f0f0;">${medicalRecordsAPI.formatDate(r.date_visited)}</td>
                    <td style="padding:8px;border:1px solid #f0f0f0;">${r.date_of_next_visit ? medicalRecordsAPI.formatDate(r.date_of_next_visit) : 'N/A'}</td>
                    <td style="padding:8px;border:1px solid #f0f0f0;">See Details</td>
                </tr>
            `).join('');

            const tableHtml = `
                <table style="width:100%;border-collapse:collapse;font-size:11px;">
                    <thead>
                        <tr style="background:#e0ffe6;color:#045b26;">
                            <th style="padding:8px;border:1px solid #d9f2dc;">Reason for Visit</th>
                            <th style="padding:8px;border:1px solid #d9f2dc;">Date Visited</th>
                            <th style="padding:8px;border:1px solid #d9f2dc;">Date of Next Visit</th>
                            <th style="padding:8px;border:1px solid #d9f2dc;">Procedures / Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml || `<tr><td colspan="4" style="padding:12px;text-align:center;color:#666;">No medical records found.</td></tr>`}
                    </tbody>
                </table>
            `;

            const html = `
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding:16px;">
                    ${headerHtml}
                    ${petInfoHtml}
                    ${tableHtml}
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });

            const fileName = `Medical_Records_${petName.replace(/[^a-z0-9_-]/gi, '_')}_${Date.now()}.pdf`;
            const dest = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.moveAsync({ from: uri, to: dest });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(dest, { mimeType: 'application/pdf', dialogTitle: 'Share Medical Records PDF' });
            } else {
                Alert.alert('Exported', `PDF saved to: ${dest}`);
            }
        } catch (e) {
            console.error('Export PDF error:', e);
            Alert.alert('Export failed', 'Could not export medical records to PDF.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => onNavigate('Pet profile')}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Medical Records</Text>
                    </View>
                    <TouchableOpacity style={styles.exportButton} onPress={() => Alert.alert('Export', 'Exporting medical records...')}>
                        <MaterialIcons name="file-download" size={18} color="#fff" />
                        <Text style={styles.exportButtonText}>Export file</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#045b26" />
                    <Text style={{ marginTop: 16, color: '#666' }}>Loading medical records...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => onNavigate('Pet profile')}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Medical Records</Text>
                </View>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error" size={48} color="#ff0000" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => onNavigate('Pet profile')}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Medical Records</Text>
                </View>
                <TouchableOpacity style={styles.exportButton} onPress={handleExportPdf}>
                    <MaterialIcons name="file-download" size={14} color="#fff" />
                    <Text style={styles.exportButtonText}>Export file</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Pet Information Section */}
                {petInfo && (
                    <View style={styles.petInfoSection}>
                        <Text style={styles.petInfoTitle}>Pet Information</Text>
                        
                        <View style={styles.petInfoItem}>
                            <Text style={styles.petInfoLabel}>Name:</Text>
                            <Text style={styles.petInfoValue}>{petInfo.name}</Text>
                        </View>
                        <View style={styles.petInfoItem}>
                            <Text style={styles.petInfoLabel}>Age:</Text>
                            <Text style={styles.petInfoValue}>
                                {petInfo.date_of_birth ? medicalRecordsAPI.calculateAge(petInfo.date_of_birth) : 'Unknown'}
                            </Text>
                        </View>
                        <View style={styles.petInfoItem}>
                            <Text style={styles.petInfoLabel}>Date of Birth:</Text>
                            <Text style={styles.petInfoValue}>
                                {petInfo.date_of_birth ? medicalRecordsAPI.formatDate(petInfo.date_of_birth) : 'Unknown'}
                            </Text>
                        </View>
                        <View style={styles.petInfoItem}>
                            <Text style={styles.petInfoLabel}>Gender:</Text>
                            <Text style={styles.petInfoValue}>{petInfo.gender || 'Unknown'}</Text>
                        </View>
                    </View>
                )}

                {/* Medical Records Table */}
                <View style={styles.tableContainer}>                    
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.headerCell}>Reason for Visit</Text>
                        <Text style={styles.headerCell}>Date Visited</Text>
                        <Text style={styles.headerCell}>Date of Next Visit</Text>
                        <Text style={[styles.headerCell, styles.lastHeaderCell]}>Procedures / Details</Text>
                    </View>

                    {/* Medical Records */}
                    {medicalRecords.length > 0 ? (
                        medicalRecords.map((record) => (
                            <View key={record.id} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{record.reason_for_visit}</Text>
                                <Text style={styles.tableCell}>
                                    {medicalRecordsAPI.formatDate(record.date_visited)}
                                </Text>
                                <Text style={styles.tableCell}>
                                    {record.date_of_next_visit ? medicalRecordsAPI.formatDate(record.date_of_next_visit) : 'N/A'}
                                </Text>
                                <View style={[styles.tableCell, styles.lastCell]}>
                                    <TouchableOpacity onPress={() => handleRecordPress(record)}>
                                        <Text style={styles.clickableText}>See Details</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <MaterialIcons name="medical-services" size={48} color="#ccc" />
                            <Text style={styles.emptyStateText}>
                                No medical records found for this pet.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Medical Visit Details Modal */}
            {selectedRecord && (
                <MedicalVisitDetailsModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setSelectedRecord(null);
                    }}
                    medicalVisitData={medicalRecordsAPI.convertToMedicalVisitData(selectedRecord, petInfo)}
                />
            )}
        </SafeAreaView>
    );
} 