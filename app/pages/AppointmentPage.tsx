import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f7f7f7' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#045b26', marginBottom: 16 },
    section: { marginBottom: 24 },
    label: { fontSize: 15, color: '#045b26', marginBottom: 4, marginTop: 12 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e0ffe6',
    },
    calendarBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0ffe6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    calendarText: { color: '#045b26', fontSize: 15, marginLeft: 8 },
    appointmentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
    },
    cardTitle: { fontWeight: 'bold', color: '#045b26', fontSize: 16, marginBottom: 4 },
    cardDetail: { color: '#333', fontSize: 14 },
    addBtn: {
        backgroundColor: '#045b26',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

const mockAppointments = [
    {
        id: 1,
        for: 'Vaccination',
        species: 'Dog',
        petId: 'D-001',
        number: 1,
        age: '2 years',
        birthday: '2023-01-10',
        date: '2025-04-25',
    },
    {
        id: 2,
        for: 'Checkup',
        species: 'Cat',
        petId: 'C-002',
        number: 1,
        age: '1 year',
        birthday: '2024-03-15',
        date: '2025-05-01',
    },
];

export default function AppointmentPage() {
    const [appointments, setAppointments] = useState(mockAppointments);
    const [form, setForm] = useState({
        for: '',
        species: '',
        number: '',
        petId: '',
        age: '',
        birthday: '',
        date: '',
    });
    const [showCalendar, setShowCalendar] = useState(false);

    // For simplicity, use a text input for date. Replace with a calendar picker for production.
    const handleAdd = () => {
        if (!form.for || !form.species || !form.number || !form.petId || !form.age || !form.birthday || !form.date) {
            alert('Please fill in all fields.');
            return;
        }
        setAppointments([
            ...appointments,
            { ...form, number: Number(form.number), id: Date.now() },
        ]);
        setForm({ for: '', species: '', number: '', petId: '', age: '', birthday: '', date: '' });
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Appointments</Text>
            <View style={styles.section}>
                <Text style={{ fontWeight: 'bold', color: '#045b26', marginBottom: 8 }}>Upcoming Appointments</Text>
                {appointments.length === 0 && <Text style={{ color: '#999' }}>No appointments yet.</Text>}
                {appointments.map((a) => (
                    <View key={a.id} style={styles.appointmentCard}>
                        <Text style={styles.cardTitle}>{a.for} ({a.species})</Text>
                        <Text style={styles.cardDetail}>Pet ID: {a.petId}</Text>
                        <Text style={styles.cardDetail}>Number: {a.number}</Text>
                        <Text style={styles.cardDetail}>Age: {a.age}</Text>
                        <Text style={styles.cardDetail}>Birthday: {a.birthday}</Text>
                        <Text style={styles.cardDetail}>Date: {a.date}</Text>
                    </View>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={{ fontWeight: 'bold', color: '#045b26', marginBottom: 8 }}>Schedule New Appointment</Text>
                <Text style={styles.label}>Appointment for</Text>
                <TextInput style={styles.input} value={form.for} onChangeText={v => setForm(f => ({ ...f, for: v }))} placeholder="e.g. Vaccination, Checkup" />
                <Text style={styles.label}>Type of species</Text>
                <TextInput style={styles.input} value={form.species} onChangeText={v => setForm(f => ({ ...f, species: v }))} placeholder="e.g. Dog, Cat" />
                <Text style={styles.label}>Number of pet</Text>
                <TextInput style={styles.input} value={form.number} onChangeText={v => setForm(f => ({ ...f, number: v }))} placeholder="e.g. 1" keyboardType="numeric" />
                <Text style={styles.label}>Pet ID</Text>
                <TextInput style={styles.input} value={form.petId} onChangeText={v => setForm(f => ({ ...f, petId: v }))} placeholder="e.g. D-001" />
                <Text style={styles.label}>Age</Text>
                <TextInput style={styles.input} value={form.age} onChangeText={v => setForm(f => ({ ...f, age: v }))} placeholder="e.g. 2 years" />
                <Text style={styles.label}>Birthday</Text>
                <TextInput style={styles.input} value={form.birthday} onChangeText={v => setForm(f => ({ ...f, birthday: v }))} placeholder="YYYY-MM-DD" />
                <Text style={styles.label}>Appointment Date</Text>
                <TextInput style={styles.input} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" />
                <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                    <Text style={styles.addBtnText}>Add Appointment</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
