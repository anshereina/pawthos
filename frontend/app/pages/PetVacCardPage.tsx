import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { vaccinationRecordsAPI, VaccinationRecord } from '../../utils/vaccinationRecords.utils';
import { getPets, PetData } from '../../utils/pets.utils';

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
        paddingVertical: 16,
        backgroundColor: '#fff',
        elevation: 2,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        marginRight: 16,
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#000' 
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    errorText: {
        fontSize: 16,
        color: '#ff4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#045b26',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});

interface VaccinationRecordWithPet extends VaccinationRecord {
    pet_name?: string;
    pet_species?: string;
}

export default function PetVacCardPage({ onNavigate, petId }: { onNavigate: (page: string, data?: any) => void, petId?: number }) {
    const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecordWithPet[]>([]);
    const [petInfo, setPetInfo] = useState<PetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVaccinationData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch all vaccination records
            const records = await vaccinationRecordsAPI.getVaccinationRecords();
            
            // Fetch pets to get pet information
            const petsResult = await getPets();
            if (petsResult.success && petsResult.data) {
                const petsData = Array.isArray(petsResult.data) ? petsResult.data : [petsResult.data];
                
                // Filter records for specific pet if petId is provided
                let filteredRecords = records;
                if (petId) {
                    filteredRecords = records.filter(record => record.pet_id === petId);
                }
                
                // Combine vaccination records with pet information
                const recordsWithPets = filteredRecords.map(record => {
                    const pet = petsData.find(p => p.id === record.pet_id);
                    return {
                        ...record,
                        pet_name: pet?.name || `Pet #${record.pet_id}`,
                        pet_species: pet?.species || 'Unknown'
                    };
                });
                
                setVaccinationRecords(recordsWithPets);
                
                // Set pet info for the first record or specific pet
                if (petId) {
                    const pet = petsData.find(p => p.id === petId);
                    setPetInfo(pet || null);
                } else if (recordsWithPets.length > 0) {
                    const pet = petsData.find(p => p.id === recordsWithPets[0].pet_id);
                    setPetInfo(pet || null);
                }
            } else {
                setVaccinationRecords(records);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch vaccination records');
            console.error('Error fetching vaccination records:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVaccinationData();
    }, [petId]);

    const handleRetry = () => {
        fetchVaccinationData();
    };

    const handleExportPdf = async () => {
        try {
            const petName = petInfo?.name || 'Pet';
            const headerHtml = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h1 style="margin:0;color:#000;font-size:20px;">Vaccination Card</h1>
                    <div style="font-size:12px;color:#555;">${new Date().toLocaleString()}</div>
                </div>
            `;

            const petInfoHtml = petInfo ? `
                <div style="border:1px solid #eaeaea;border-radius:8px;padding:12px;margin-bottom:16px;">
                    <h2 style="margin:0 0 8px 0;color:#045b26;font-size:14px;">Pet Information</h2>
                    <table style="width:100%;font-size:12px;color:#333;">
                        <tr><td style="width:120px;font-weight:bold;color:#045b26;">Name:</td><td>${petInfo.name}</td></tr>
                        <tr><td style="width:120px;font-weight:bold;color:#045b26;">Age:</td><td>${petInfo.date_of_birth ? calculateAge(petInfo.date_of_birth) : 'Unknown'}</td></tr>
                        <tr><td style="width:120px;font-weight:bold;color:#045b26;">Date of Birth:</td><td>${petInfo.date_of_birth ? formatDate(petInfo.date_of_birth) : 'Unknown'}</td></tr>
                        <tr><td style="width:120px;font-weight:bold;color:#045b26;">Gender:</td><td>${petInfo.gender || 'Unknown'}</td></tr>
                    </table>
                </div>
            ` : '';

            const rowsHtml = (vaccinationRecords || []).map(r => `
                <tr>
                    <td style="padding:8px;border:1px solid #f0f0f0;">${formatDate(r.vaccination_date)}</td>
                    <td style="padding:8px;border:1px solid #f0f0f0;">${r.vaccine_name}</td>
                    <td style="padding:8px;border:1px solid #f0f0f0;">${r.batch_lot_no || 'N/A'}</td>
                    <td style="padding:8px;border:1px solid #f0f0f0;">${r.expiration_date ? formatDate(r.expiration_date) : 'N/A'}</td>
                    <td style="padding:8px;border:1px solid #f0f0f0;">${r.veterinarian || 'N/A'}</td>
                </tr>
            `).join('');

            const tableHtml = `
                <table style="width:100%;border-collapse:collapse;font-size:11px;">
                    <thead>
                        <tr style="background:#e0ffe6;color:#045b26;">
                            <th style="padding:8px;border:1px solid #d9f2dc;">Date of Vaccination</th>
                            <th style="padding:8px;border:1px solid #d9f2dc;">Vaccine Used</th>
                            <th style="padding:8px;border:1px solid #d9f2dc;">Lot No./ Batch No.</th>
                            <th style="padding:8px;border:1px solid #d9f2dc;">Date of next Vaccination</th>
                            <th style="padding:8px;border:1px solid #d9f2dc;">Vet. Lic No. PTR</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml || `<tr><td colspan="5" style="padding:12px;text-align:center;color:#666;">No vaccination records found.</td></tr>`}
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

            const fileName = `Vaccination_Card_${petName.replace(/[^a-z0-9_-]/gi, '_')}_${Date.now()}.pdf`;
            const dest = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.moveAsync({ from: uri, to: dest });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(dest, { mimeType: 'application/pdf', dialogTitle: 'Share Vaccination Card PDF' });
            } else {
                Alert.alert('Exported', `PDF saved to: ${dest}`);
            }
        } catch (e) {
            console.error('Export PDF error:', e);
            Alert.alert('Export failed', 'Could not export vaccination card to PDF.');
        }
    };

    const handleBackButton = () => {
        onNavigate('Pet profile');
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const calculateAge = (dateOfBirth: string) => {
        try {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            const ageInYears = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                return `${ageInYears - 1} years`;
            }
            return `${ageInYears} years`;
        } catch {
            return 'Unknown';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={handleBackButton}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Pet VacCard</Text>
                    </View>
                    <TouchableOpacity style={styles.exportButton} onPress={() => Alert.alert('Export', 'Exporting vaccination card...')}>
                        <MaterialIcons name="file-download" size={18} color="#fff" />
                        <Text style={styles.exportButtonText}>Export file</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#045b26" />
                    <Text style={{ marginTop: 16, color: '#666' }}>Loading vaccination card...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={handleBackButton}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Pet VacCard</Text>
                    </View>
                    <TouchableOpacity style={styles.exportButton} onPress={() => Alert.alert('Export', 'Exporting vaccination card...')}>
                        <MaterialIcons name="file-download" size={18} color="#fff" />
                        <Text style={styles.exportButtonText}>Export file</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
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
                        onPress={handleBackButton}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Pet VacCard</Text>
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
                    
                    <View style={styles.petInfoRow}>
                        <View style={styles.petInfoColumn}>
                            <View style={styles.petInfoItem}>
                                <Text style={styles.petInfoLabel}>Name:</Text>
                                    <Text style={styles.petInfoValue}>{petInfo.name}</Text>
                            </View>
                            <View style={styles.petInfoItem}>
                                <Text style={styles.petInfoLabel}>Age:</Text>
                                    <Text style={styles.petInfoValue}>
                                        {petInfo.date_of_birth ? calculateAge(petInfo.date_of_birth) : 'Unknown'}
                                    </Text>
                            </View>
                        </View>
                        <View style={styles.petInfoColumn}>
                            <View style={styles.petInfoItem}>
                                <Text style={styles.petInfoLabel}>Date of Birth:</Text>
                                    <Text style={styles.petInfoValue}>
                                        {petInfo.date_of_birth ? formatDate(petInfo.date_of_birth) : 'Unknown'}
                                    </Text>
                            </View>
                            <View style={styles.petInfoItem}>
                                <Text style={styles.petInfoLabel}>Gender:</Text>
                                    <Text style={styles.petInfoValue}>{petInfo.gender || 'Unknown'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                )}

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

                    {/* Vaccination Records */}
                    {vaccinationRecords.length > 0 ? (
                        vaccinationRecords.map((record, index) => (
                            <View key={record.id} style={styles.tableRow}>
                                <Text style={styles.tableCell}>
                                    {formatDate(record.vaccination_date)}
                                </Text>
                                <Text style={styles.tableCell}>
                                    {record.vaccine_name}
                                </Text>
                                <Text style={styles.tableCell}>
                                    {record.batch_lot_no || 'N/A'}
                                </Text>
                                <Text style={styles.tableCell}>
                                    {record.expiration_date ? formatDate(record.expiration_date) : 'N/A'}
                                </Text>
                                <Text style={[styles.tableCell, styles.lastCell]}>
                                    {record.veterinarian || 'N/A'}
                                </Text>
                    </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No vaccination records found</Text>
                    </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 