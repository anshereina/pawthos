import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const FAQS = [
    {
        question: 'How do I book an appointment?',
        answer: 'Go to the Appointment section from the menu and follow the steps to book your preferred date and time.'
    },
    {
        question: 'How do I add a new pet profile?',
        answer: 'Navigate to Pet Information > Pet Profile and tap the add button to enter your pet’s details.'
    },
    {
        question: 'How can I view my pet\'s vaccine records?',
        answer: 'Select Pet Information > Vaccine Records to see all recorded vaccinations for your pets.'
    },
    {
        question: 'How do I get a shipping permit?',
        answer: 'Go to Pet Information or Other Services and select Shipping Permit. Fill out the required information.'
    },
    {
        question: 'How do I contact a veterinarian?',
        answer: 'Use the Vet Health section to find and contact available veterinarians.'
    },
    {
        question: 'How do I reset my password?',
        answer: 'On the login page, tap “Forgot password?” and follow the instructions.'
    },
];

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f7f7f7' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#045b26', marginBottom: 16 },
    notificationBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#4CAF50',
        borderRadius: 14,
        padding: 18,
        marginBottom: 16,
        elevation: 2,
    },
    iconCol: {
        marginRight: 14,
        marginTop: 2,
    },
    eventTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
        marginBottom: 6,
    },
    eventDetail: {
        color: '#fff',
        fontSize: 12,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    location: {
        color: '#fff',
        fontSize: 12,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    reminder: {
        color: '#fff',
        fontSize: 12,
        fontStyle: 'italic',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        marginBottom: 14,
        elevation: 1,
    },
    questionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    question: { fontSize: 16, fontWeight: 'bold', color: '#045b26', flex: 1 },
    answer: { fontSize: 15, color: '#333', marginLeft: 28 },
});

export default function FAQsPage() {
    const [open, setOpen] = React.useState<number | null>(null);
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Frequently Asked Questions</Text>
            
            {/* Event Notification Box */}
            <View style={styles.notificationBox}>
                <View style={styles.iconCol}>
                    <MaterialCommunityIcons name="needle" size={28} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>FREE CONSULTATION & VACCINATION</Text>
                    <Text style={styles.eventDetail}>Every Wednesday and Friday</Text>
                    <Text style={styles.location}>Location: 2nd floor of the New City Hall Building</Text>
                    <Text style={styles.reminder}>Reminder: Bring your Pet VacCard or Ready your PawThas App.</Text>
                </View>
            </View>
            {FAQS.map((faq, idx) => (
                <TouchableOpacity key={faq.question} style={styles.card} onPress={() => setOpen(open === idx ? null : idx)} activeOpacity={0.9}>
                    <View style={styles.questionRow}>
                        <MaterialIcons name="help-outline" size={22} color="#045b26" style={{ marginRight: 8 }} />
                        <Text style={styles.question}>{faq.question}</Text>
                        <MaterialIcons name={open === idx ? 'expand-less' : 'expand-more'} size={22} color="#045b26" />
                    </View>
                    {open === idx && <Text style={styles.answer}>{faq.answer}</Text>}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
