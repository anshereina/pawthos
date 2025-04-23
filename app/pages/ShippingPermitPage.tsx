import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const mockPermits = [
    {
        id: 'S-001',
        type: 'Shipping Permit',
        pet: 'Buddy',
        issued: '2024-02-10',
        validUntil: '2025-02-10',
        status: 'Valid',
        destination: 'Manila',
    },
    {
        id: 'S-002',
        type: 'Shipping Permit',
        pet: 'Mittens',
        issued: '2024-04-01',
        validUntil: '2025-04-01',
        status: 'Valid',
        destination: 'Cebu',
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
});

export default function ShippingPermitPage() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Shipping Permits</Text>
            {mockPermits.length === 0 && <Text style={{ color: '#999' }}>No shipping permits found.</Text>}
            {mockPermits.map((permit, idx) => (
                <View key={idx} style={styles.card}>
                    <Text style={styles.label}>Type:</Text>
                    <Text style={styles.value}>{permit.type}</Text>
                    <Text style={styles.label}>Pet:</Text>
                    <Text style={styles.value}>{permit.pet}</Text>
                    <Text style={styles.label}>Issued:</Text>
                    <Text style={styles.value}>{permit.issued}</Text>
                    <Text style={styles.label}>Valid Until:</Text>
                    <Text style={styles.value}>{permit.validUntil}</Text>
                    <Text style={styles.label}>Destination:</Text>
                    <Text style={styles.value}>{permit.destination}</Text>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.value}>{permit.status}</Text>
                </View>
            ))}
        </ScrollView>
    );
}
