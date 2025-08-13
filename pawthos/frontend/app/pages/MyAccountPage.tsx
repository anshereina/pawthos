import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f7f7f7' },
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    avatar: { width: 80, height: 80, borderRadius: 40, marginRight: 20, backgroundColor: '#e0ffe6' },
    name: { fontSize: 22, fontWeight: 'bold', color: '#045b26' },
    email: { fontSize: 16, color: '#045b26', marginBottom: 8 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#045b26', marginBottom: 8 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    itemIcon: { marginRight: 12 },
    itemText: { fontSize: 15, color: '#333' },
    editBtn: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#e0ffe6', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 16 },
    editBtnText: { color: '#045b26', fontWeight: 'bold' },
});

export default function MyAccountPage() {
    return (
        <View style={styles.container}>
            <View style={styles.profileRow}>
                <Image source={require('../../assets/images/logo_2.png')} style={styles.avatar} />
                <View>
                    <Text style={styles.name}>User Name</Text>
                    <Text style={styles.email}>user@email.com</Text>
                    <TouchableOpacity style={styles.editBtn} onPress={() => alert('Edit profile (placeholder)')}>
                        <Text style={styles.editBtnText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.itemRow}>
                    <MaterialIcons name="phone" size={20} color="#045b26" style={styles.itemIcon} />
                    <Text style={styles.itemText}>+63 900 000 0000</Text>
                </View>
                <View style={styles.itemRow}>
                    <MaterialIcons name="location-on" size={20} color="#045b26" style={styles.itemIcon} />
                    <Text style={styles.itemText}>123 Pet Street, City</Text>
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings</Text>
                <View style={styles.itemRow}>
                    <MaterialIcons name="lock-outline" size={20} color="#045b26" style={styles.itemIcon} />
                    <Text style={styles.itemText}>Change Password</Text>
                </View>
                <View style={styles.itemRow}>
                    <MaterialIcons name="notifications" size={20} color="#045b26" style={styles.itemIcon} />
                    <Text style={styles.itemText}>Notifications</Text>
                </View>
            </View>
        </View>
    );
}
