import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomePage({ onSelect }: { onSelect: (label: string) => void }) {
    return (
        <View style={{ flex: 1, padding: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <Image source={require('../../assets/images/logo_1.png')} style={{ width: 64, height: 64, borderRadius: 32, marginRight: 16 }} />
                <View>
                    <Text style={{ fontSize: 22, color: '#045b26', fontWeight: 'bold' }}>Hi, User!</Text>
                    <Text style={{ fontSize: 16, color: '#045b26' }}>Let's take care of your pets!</Text>
                </View>
            </View>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 24, elevation: 2, height: 48 }}>
                <MaterialIcons name="search" size={22} color="#045b26" />
                <Text style={{ color: '#b2d8c5', marginLeft: 8, fontSize: 16 }}>[Search bar placeholder]</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {['My account', 'Appointment', 'Pet profile', 'Vaccine history', 'Medical history', 'Vet health', 'Certificate', 'Shipping permit', 'Other services', `FAQ's`].map((label) => (
                    <TouchableOpacity
                        key={label}
                        style={{
                            width: '47%',
                            backgroundColor: '#e0ffe6',
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 16,
                            alignItems: 'center',
                            elevation: 1,
                        }}
                        onPress={() => onSelect(label)}
                    >
                        <Text style={{ color: '#045b26', fontWeight: 'bold', fontSize: 16 }}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
