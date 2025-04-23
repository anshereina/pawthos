import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

const mockPets = [
    {
        id: 'P-001',
        name: 'Buddy',
        photo: require('../../assets/images/logo_1.png'),
    },
    {
        id: 'P-002',
        name: 'Mittens',
        photo: require('../../assets/images/logo_2.png'),
    },
];

const mockMedicalHistory: { [key: string]: { date: string; reason: string; vet: string; notes: string; }[] } = {
    'P-001': [
        { date: '2024-02-10', reason: 'Checkup', vet: 'Dr. Smith', notes: 'Healthy, no issues.' },
        { date: '2024-07-20', reason: 'Fever', vet: 'Dr. Lee', notes: 'Prescribed antibiotics.' },
    ],
    'P-002': [
        { date: '2024-04-01', reason: 'Vaccination', vet: 'Dr. Cat', notes: 'All good.' },
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
});

export default function MedicalHistoryPage() {
    const [selectedPet, setSelectedPet] = useState(mockPets[0]);
    const history = mockMedicalHistory[selectedPet.id] || [];
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Medical History</Text>
            <View style={styles.petSelectRow}>
                {mockPets.map((pet) => (
                    <TouchableOpacity key={pet.id} style={[styles.petBtn, selectedPet.id === pet.id && styles.selected]} onPress={() => setSelectedPet(pet)}>
                        <Image source={pet.photo} style={styles.petImg} />
                        <Text style={styles.petName}>{pet.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {history.length === 0 && <Text style={{ color: '#999' }}>No medical history for this pet.</Text>}
            {history.map((m, idx) => (
                <View key={idx} style={styles.card}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>{m.date}</Text>
                    <Text style={styles.label}>Reason:</Text>
                    <Text style={styles.value}>{m.reason}</Text>
                    <Text style={styles.label}>Veterinarian:</Text>
                    <Text style={styles.value}>{m.vet}</Text>
                    <Text style={styles.label}>Notes:</Text>
                    <Text style={styles.value}>{m.notes}</Text>
                </View>
            ))}
        </ScrollView>
    );
}
