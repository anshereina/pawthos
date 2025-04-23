import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import VaccineHistoryPage from './VaccineHistoryPage';
import MedicalHistoryPage from './MedicalHistoryPage';

const mockPets = [
    {
        id: 'P-001',
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        gender: 'Male',
        age: '2 years',
        birthday: '2023-01-10',
        photo: require('../../assets/images/logo_1.png'),
    },
    {
        id: 'P-002',
        name: 'Mittens',
        species: 'Cat',
        breed: 'Siamese',
        gender: 'Female',
        age: '1 year',
        birthday: '2024-03-15',
        photo: require('../../assets/images/logo_2.png'),
    },
];

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f7f7f7' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#045b26', marginBottom: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 1,
    },
    petPhoto: { width: 64, height: 64, borderRadius: 32, marginRight: 16, backgroundColor: '#e0ffe6' },
    petInfo: { flex: 1 },
    petName: { fontSize: 18, fontWeight: 'bold', color: '#045b26' },
    petDetails: { color: '#333', fontSize: 14 },
    addBtn: {
        backgroundColor: '#045b26',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    form: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 24 },
    label: { fontSize: 15, color: '#045b26', marginBottom: 4, marginTop: 12 },
    input: {
        backgroundColor: '#e0ffe6',
        borderRadius: 8,
        padding: 10,
        fontSize: 15,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#b2d8c5',
    },
    saveBtn: {
        backgroundColor: '#045b26',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default function PetProfilePage() {
    const [pets, setPets] = useState(mockPets);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        species: '',
        breed: '',
        gender: '',
        age: '',
        birthday: '',
    });
    const [view, setView] = useState<'list' | 'detail' | 'vaccine' | 'medical'>('list');
    const [selectedPet, setSelectedPet] = useState<typeof mockPets[0] | null>(null);

    function handleViewVaccineCard(pet: typeof mockPets[0]) {
        setSelectedPet(pet);
        setView('vaccine');
    }

    function handleViewMedicalHistory(pet: typeof mockPets[0]) {
        setSelectedPet(pet);
        setView('medical');
    }

    const handleAddPet = () => {
        if (!form.name || !form.species || !form.breed || !form.gender || !form.age || !form.birthday) {
            alert('Please fill in all fields.');
            return;
        }
        setPets([
            ...pets,
            {
                id: `P-${Date.now()}`,
                ...form,
                photo: require('../../assets/images/logo_1.png'), // Placeholder photo
            },
        ]);
        setForm({ name: '', species: '', breed: '', gender: '', age: '', birthday: '' });
        setShowForm(false);
    };

    if (view === 'vaccine' && selectedPet) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
                <TouchableOpacity onPress={() => setView('detail')} style={{ margin: 24 }}>
                    <MaterialIcons name="arrow-back" size={28} color="#045b26" />
                </TouchableOpacity>
                <VaccineHistoryPage />
            </View>
        );
    }
    if (view === 'medical' && selectedPet) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
                <TouchableOpacity onPress={() => setView('detail')} style={{ margin: 24 }}>
                    <MaterialIcons name="arrow-back" size={28} color="#045b26" />
                </TouchableOpacity>
                <MedicalHistoryPage />
            </View>
        );
    }
    if (view === 'detail' && selectedPet) {
        return (
            <View style={{ flex: 1, padding: 24, backgroundColor: '#f7f7f7' }}>
                <TouchableOpacity onPress={() => setView('list')} style={{ marginBottom: 16 }}>
                    <MaterialIcons name="arrow-back" size={28} color="#045b26" />
                </TouchableOpacity>
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <Image source={selectedPet.photo} style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#e0ffe6', marginBottom: 12 }} />
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#045b26' }}>{selectedPet.name}</Text>
                    <Text style={{ color: '#333', fontSize: 16 }}>{selectedPet.species} | {selectedPet.breed} | {selectedPet.gender}</Text>
                </View>
                <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 24 }}>
                    <Text style={{ color: '#045b26', fontWeight: 'bold', marginBottom: 8 }}>Pet Details</Text>
                    <Text style={{ color: '#333', fontSize: 15 }}>ID: {selectedPet.id}</Text>
                    <Text style={{ color: '#333', fontSize: 15 }}>Age: {selectedPet.age}</Text>
                    <Text style={{ color: '#333', fontSize: 15 }}>Birthday: {selectedPet.birthday}</Text>
                </View>
                <TouchableOpacity style={{ backgroundColor: '#e0ffe6', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 12 }} onPress={() => handleViewVaccineCard(selectedPet)}>
                    <Text style={{ color: '#045b26', fontWeight: 'bold', fontSize: 16 }}>View Vaccine Card</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: '#e0ffe6', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }} onPress={() => handleViewMedicalHistory(selectedPet)}>
                    <Text style={{ color: '#045b26', fontWeight: 'bold', fontSize: 16 }}>View Medical History</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Pet Profiles</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
                <Text style={styles.addBtnText}>{showForm ? 'Cancel' : 'Add New Pet'}</Text>
            </TouchableOpacity>
            {showForm && (
                <View style={styles.form}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput style={styles.input} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="Pet name" />
                    <Text style={styles.label}>Species</Text>
                    <TextInput style={styles.input} value={form.species} onChangeText={v => setForm(f => ({ ...f, species: v }))} placeholder="e.g. Dog, Cat" />
                    <Text style={styles.label}>Breed</Text>
                    <TextInput style={styles.input} value={form.breed} onChangeText={v => setForm(f => ({ ...f, breed: v }))} placeholder="e.g. Golden Retriever" />
                    <Text style={styles.label}>Gender</Text>
                    <TextInput style={styles.input} value={form.gender} onChangeText={v => setForm(f => ({ ...f, gender: v }))} placeholder="Male/Female" />
                    <Text style={styles.label}>Age</Text>
                    <TextInput style={styles.input} value={form.age} onChangeText={v => setForm(f => ({ ...f, age: v }))} placeholder="e.g. 2 years" />
                    <Text style={styles.label}>Birthday</Text>
                    <TextInput style={styles.input} value={form.birthday} onChangeText={v => setForm(f => ({ ...f, birthday: v }))} placeholder="YYYY-MM-DD" />
                    <TouchableOpacity style={styles.saveBtn} onPress={handleAddPet}>
                        <Text style={styles.saveBtnText}>Save Pet</Text>
                    </TouchableOpacity>
                </View>
            )}
            {pets.map((pet) => (
                <TouchableOpacity key={pet.id} style={styles.card} onPress={() => { setSelectedPet(pet); setView('detail'); }}>
                    <Image source={pet.photo} style={styles.petPhoto} />
                    <View style={styles.petInfo}>
                        <Text style={styles.petName}>{pet.name}</Text>
                        <Text style={styles.petDetails}>{pet.species} | {pet.breed} | {pet.gender}</Text>
                        <Text style={styles.petDetails}>Age: {pet.age}</Text>
                        <Text style={styles.petDetails}>Birthday: {pet.birthday}</Text>
                        <Text style={styles.petDetails}>ID: {pet.id}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
