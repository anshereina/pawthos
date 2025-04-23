import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const mockVetVisits = [
    {
        date: '2025-03-10',
        vet: 'Dr. Smith',
        clinic: 'Happy Paws Clinic',
        reason: 'Annual Checkup',
        notes: 'Healthy, no issues.',
    },
    {
        date: '2025-01-22',
        vet: 'Dr. Lee',
        clinic: 'Pet Wellness Center',
        reason: 'Vaccination',
        notes: 'Rabies vaccine administered.',
    },
];

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f7f7f7' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#045b26', marginBottom: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        elevation: 1,
    },
    label: { color: '#045b26', fontWeight: 'bold', fontSize: 16 },
    value: { color: '#333', fontSize: 15, marginBottom: 4 },
    addBtn: {
        backgroundColor: '#045b26',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
});

export default function VetHealthPage() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Vet Health Visits</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => alert('Schedule new vet visit (placeholder)')}>
                <MaterialIcons name="add-circle-outline" size={22} color="#fff" />
                <Text style={styles.addBtnText}>Schedule New Visit</Text>
            </TouchableOpacity>
            {mockVetVisits.length === 0 && <Text style={{ color: '#999' }}>No vet visits yet.</Text>}
            {mockVetVisits.map((visit, idx) => (
                <View key={idx} style={styles.card}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>{visit.date}</Text>
                    <Text style={styles.label}>Veterinarian:</Text>
                    <Text style={styles.value}>{visit.vet}</Text>
                    <Text style={styles.label}>Clinic:</Text>
                    <Text style={styles.value}>{visit.clinic}</Text>
                    <Text style={styles.label}>Reason:</Text>
                    <Text style={styles.value}>{visit.reason}</Text>
                    <Text style={styles.label}>Notes:</Text>
                    <Text style={styles.value}>{visit.notes}</Text>
                </View>
            ))}
        </ScrollView>
    );
}
