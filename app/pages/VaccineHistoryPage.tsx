import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

const mockPets = [
    {
        id: 'P-001',
        name: 'Buddy',
        age: '2 years',
        dob: '2023-01-10',
        gender: 'Male',
        photo: require('../../assets/images/logo_1.png'),
    },
    {
        id: 'P-002',
        name: 'Mittens',
        age: '1 year',
        dob: '2024-03-15',
        gender: 'Female',
        photo: require('../../assets/images/logo_2.png'),
    },
];

const mockVaccines: { [key: string]: { date: string; vaccine: string; lot: string; next: string; vet: string; }[] } = {
    'P-001': [
        { date: '2024-01-10', vaccine: 'Rabies', lot: 'RB-12345', next: '2025-01-10', vet: '1234567' },
        { date: '2024-06-15', vaccine: 'Parvo', lot: 'PV-67890', next: '2025-06-15', vet: '7654321' },
    ],
    'P-002': [
        { date: '2024-03-20', vaccine: 'FVRCP', lot: 'FV-11111', next: '2025-03-20', vet: '8888888' },
    ],
};

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
    petSelectRow: { flexDirection: 'row', marginBottom: 24 },
    petBtn: { alignItems: 'center', marginRight: 24 },
    petImg: { width: 56, height: 56, borderRadius: 28, marginBottom: 6, backgroundColor: '#e0ffe6' },
    petName: { color: '#045b26', fontWeight: 'bold', fontSize: 14 },
    selected: { borderWidth: 2, borderColor: '#045b26' },
    infoRow: { flexDirection: 'row', marginBottom: 8 },
    tableHeader: { flexDirection: 'row', marginTop: 16, marginBottom: 8 },
    tableHeaderText: { flex: 1, fontWeight: 'bold', color: '#045b26', fontSize: 14 },
    tableRow: { flexDirection: 'row', marginBottom: 8 },
    tableCell: { flex: 1, color: '#333', fontSize: 14 },
});

export default function VaccineHistoryPage() {
    const [selectedPet, setSelectedPet] = useState(mockPets[0]);
    const vaccines = mockVaccines[selectedPet.id] || [];
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Vaccine History</Text>
            <View style={styles.petSelectRow}>
                {mockPets.map((pet) => (
                    <TouchableOpacity key={pet.id} style={[styles.petBtn, selectedPet.id === pet.id && styles.selected]} onPress={() => setSelectedPet(pet)}>
                        <Image source={pet.photo} style={styles.petImg} />
                        <Text style={styles.petName}>{pet.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{selectedPet.name}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.label}>Age:</Text>
                <Text style={styles.value}>{selectedPet.age}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.label}>Date of Birth:</Text>
                <Text style={styles.value}>{selectedPet.dob}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.label}>Gender:</Text>
                <Text style={styles.value}>{selectedPet.gender}</Text>
            </View>
            <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Date</Text>
                <Text style={styles.tableHeaderText}>Vaccine Used</Text>
                <Text style={styles.tableHeaderText}>Lot/Batch No.</Text>
                <Text style={styles.tableHeaderText}>Next Vacc.</Text>
                <Text style={styles.tableHeaderText}>Vet. Lic No. PTR</Text>
            </View>
            {vaccines.length === 0 && <Text style={{ color: '#999', marginTop: 16 }}>No vaccine records for this pet.</Text>}
            {vaccines.map((rec, idx) => (
                <View key={idx} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{rec.date}</Text>
                    <Text style={styles.tableCell}>{rec.vaccine}</Text>
                    <Text style={styles.tableCell}>{rec.lot}</Text>
                    <Text style={styles.tableCell}>{rec.next}</Text>
                    <Text style={styles.tableCell}>{rec.vet}</Text>
                </View>
            ))}
        </ScrollView>
    );
}
