import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AppointmentDetailsModal from '../modals/AppointmentDetailsModal';
import { getAppointments, updateAppointmentStatus, filterUpcomingAppointments, getAllAppointments, formatAppointmentDate, formatAppointmentTime, AppointmentData } from '../../utils/appointments.utils';

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
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#000' 
    },
    newAppointmentBtn: {
        backgroundColor: '#045b26',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        elevation: 2,
    },
    newAppointmentText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 11 
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 16,
        marginBottom: 16,
    },
    searchText: { 
        color: '#999', 
        fontSize: 16, 
        flex: 1, 
        marginLeft: 12 
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    filterBtn: {
        flex: 1,
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderRadius: 8,
        marginRight: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
    },
    filterBtnActive: {
        backgroundColor: '#045b26',
        borderColor: '#045b26',
    },
    filterBtnInactive: {
        backgroundColor: '#fff',
        borderColor: '#045b26',
    },
    filterText: { 
        fontSize: 11, 
        fontWeight: '500',
        textAlign: 'center',
        width: '100%',
    },
    filterTextActive: { 
        color: '#fff' 
    },
    filterTextInactive: { 
        color: '#045b26' 
    },
    note: {
        backgroundColor: '#fff3cd',
        borderColor: '#ffeaa7',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    noteText: {
        fontSize: 8,
        color: '#856404',
        fontStyle: 'italic',
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#A1D998',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        color: '#045b26',
        fontSize: 14,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tableCell: {
        flex: 1,
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    tableCellContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusPending: {
        color: '#045b26',
        fontWeight: 'bold',
    },
    actionModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    actionModalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    actionModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        marginBottom: 12,
    },
    actionModalButton: {
        backgroundColor: '#045b26',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    actionModalCancelButton: {
        backgroundColor: '#e6f3ea',
    },
    actionModalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    modalField: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    modalFieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    modalFieldValue: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
});

export default function AppointmentPage({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
    const [activeFilter, setActiveFilter] = useState('Upcoming');
    const [modalVisible, setModalVisible] = useState(false);
    const [appointments, setAppointments] = useState<AppointmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [actionModalVisible, setActionModalVisible] = useState(false);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const result = await getAppointments();
            if (result.success && result.data) {
                setAppointments(result.data);
            } else {
                Alert.alert('Error', result.message || 'Failed to load appointments');
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            Alert.alert('Error', 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadAppointments();
        } finally {
            setRefreshing(false);
        }
    };

    const handleStatusUpdate = async (appointmentId: number, newStatus: string) => {
        try {
            const result = await updateAppointmentStatus(appointmentId, newStatus);
            if (result.success) {
                // Refresh appointments list
                await loadAppointments();
                Alert.alert('Success', `Appointment ${newStatus} successfully`);
            } else {
                Alert.alert('Error', result.message || 'Failed to update appointment status');
            }
        } catch (error) {
            console.error('Error updating appointment status:', error);
            Alert.alert('Error', 'Failed to update appointment status');
        }
    };

    const getFilteredAppointments = () => {
        if (activeFilter === 'Upcoming') {
            return filterUpcomingAppointments(appointments);
        } else {
            // Exclude pending from Lists tab; show only non-pending
            const nonPending = appointments.filter(
                (a) => (a.status || '').toLowerCase() !== 'pending'
            );
            return getAllAppointments(nonPending);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#ffc107'; // Yellow for pending
            case 'scheduled':
                return '#045b26'; // Green for scheduled
            case 'cancelled':
                return '#dc3545'; // Red for cancelled
            default:
                return '#6c757d';
        }
    };

    const canModifyAppointment = (status: string) => {
        return status.toLowerCase() === 'pending' || status.toLowerCase() === 'scheduled';
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
            <Text style={styles.title}>Appointments</Text>
                <TouchableOpacity 
                    style={styles.newAppointmentBtn}
                    onPress={() => onNavigate('Appointment Scheduling')}
                >
                    <Text style={styles.newAppointmentText}>New Appointment</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                style={styles.content}
                data={loading ? [] : getFilteredAppointments()}
                keyExtractor={(item) => item.id.toString()}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListHeaderComponent={
                    <>
                        {/* Search Bar */}
                        <View style={styles.searchBar}>
                            <MaterialIcons name="menu" size={22} color="#666" />
                            <Text style={styles.searchText}>Search here</Text>
                            <MaterialIcons name="search" size={22} color="#666" />
                        </View>

                        {/* Filter Buttons */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity 
                                style={[
                                    styles.filterBtn, 
                                    activeFilter === 'Upcoming' ? styles.filterBtnActive : styles.filterBtnInactive
                                ]}
                                onPress={() => setActiveFilter('Upcoming')}
                            >
                                <Text style={[
                                    styles.filterText, 
                                    activeFilter === 'Upcoming' ? styles.filterTextActive : styles.filterTextInactive
                                ]}>
                                    Upcoming Appointments
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[
                                    styles.filterBtn, 
                                    activeFilter === 'Lists' ? styles.filterBtnActive : styles.filterBtnInactive
                                ]}
                                onPress={() => setActiveFilter('Lists')}
                            >
                                <Text style={[
                                    styles.filterText, 
                                    activeFilter === 'Lists' ? styles.filterTextActive : styles.filterTextInactive
                                ]}>
                                    Appointment Lists
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Note */}
                        <View style={styles.note}>
                            <Text style={styles.noteText}>Note: Click on appointment row or status to manage pending/scheduled appointments.</Text>
                        </View>

                        {/* Table Header */}
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerCell}>Date</Text>
                                <Text style={styles.headerCell}>Reason of Visit</Text>
                                <Text style={styles.headerCell}>Status</Text>
                            </View>
                        </View>

                        {/* Loading State */}
                        {loading && (
                            <View style={[styles.tableRow, { justifyContent: 'center', alignItems: 'center', paddingVertical: 24 }]}> 
                                <ActivityIndicator size="small" color="#045b26" />
                                <Text style={[styles.tableCell, { marginLeft: 8 }]}>Loading appointments...</Text>
                            </View>
                        )}
                    </>
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={[styles.tableRow, { justifyContent: 'center', alignItems: 'center', paddingVertical: 24 }]}> 
                            <Text style={styles.tableCell}>
                                {activeFilter === 'Upcoming' ? 'No upcoming appointments' : 'No appointments found'}
                            </Text>
                        </View>
                    ) : null
                }
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.tableRow}
                        onPress={() => {
                            setSelectedAppointment(item);
                            setActionModalVisible(true);
                        }}
                    >
                        <Text style={styles.tableCell}>{formatAppointmentDate(item.date)}</Text>
                        <Text style={styles.tableCell}>{item.type}</Text>
                        <TouchableOpacity
                            style={styles.tableCellContainer}
                            onPress={() => {
                                setSelectedAppointment(item);
                                setActionModalVisible(true);
                            }}
                        >
                            <Text style={[
                                styles.tableCell, 
                                { 
                                    color: getStatusColor(item.status),
                                    fontWeight: 'bold',
                                    textDecorationLine: canModifyAppointment(item.status) ? 'underline' : 'none'
                                }
                            ]}>
                                {item.status}
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />

                        {/* Appointment Details Modal */}
            {selectedAppointment && (
                <AppointmentDetailsModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setSelectedAppointment(null);
                    }}
                    appointmentData={selectedAppointment}
                />
            )}

            {/* Action Modal: Reschedule or Cancel */}
            {selectedAppointment && (
                <Modal
                    transparent
                    animationType="slide"
                    visible={actionModalVisible}
                    onRequestClose={() => setActionModalVisible(false)}
                >
                    <View style={styles.actionModalOverlay}>
                        <View style={styles.actionModalContainer}>
                            <Text style={styles.actionModalTitle}>Manage Appointment</Text>
                            
                            {canModifyAppointment(selectedAppointment.status) ? (
                                <>
                                    <TouchableOpacity
                                        style={styles.actionModalButton}
                                        onPress={() => {
                                            setActionModalVisible(false);
                                            if (selectedAppointment) {
                                                onNavigate('Appointment Scheduling', { appointmentToEdit: selectedAppointment });
                                            } else {
                                                onNavigate('Appointment Scheduling');
                                            }
                                        }}
                                    >
                                        <Text style={styles.actionModalButtonText}>Reschedule</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionModalButton, { backgroundColor: '#dc3545' }]}
                                        onPress={async () => {
                                            setActionModalVisible(false);
                                            if (selectedAppointment) {
                                                await handleStatusUpdate(selectedAppointment.id, 'cancelled');
                                                setActiveFilter('Lists');
                                            }
                                        }}
                                    >
                                        <Text style={styles.actionModalButtonText}>Cancel Appointment</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>Status:</Text>
                                    <Text style={styles.modalFieldValue}>
                                        {selectedAppointment.status === 'cancelled' 
                                            ? 'This appointment has been cancelled and cannot be modified.' 
                                            : 'This appointment cannot be modified.'}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.actionModalButton, styles.actionModalCancelButton]}
                                onPress={() => setActionModalVisible(false)}
                            >
                                <Text style={[styles.actionModalButtonText, { color: '#045b26' }]}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
}
