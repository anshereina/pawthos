import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const responsibilities = [
  'Vaccination: Owners must have their dog or cat regularly vaccinated against rabies. This should start when the pet is 3 months old and be repeated every year thereafter.',
  'Record Keeping: Owners are required to maintain a registration card that contains a complete record of all vaccinations conducted. This is for the purpose of accurate record-keeping.',
  'Registration: Owners must submit their dog for mandatory registration.',
  'Control and Leash Law: Owners must maintain control over their dog at all times. They are not allowed to let their dog roam the streets or any public places without a leash.',
  'Biting Incident Reporting: If a biting incident occurs, the owner must immediately report it within 24 hours to the nearest concerned officials. This is for investigation and to allow for any appropriate action. Additionally, the dog involved must be placed under observation by a government or private veterinarian.'
];

export default function OwnersResponsibilityPage({ onBack }: { onBack?: () => void }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack || (() => {})} style={{marginRight: 8}}>
          <MaterialIcons name="chevron-left" size={32} color="#045b26" />
        </TouchableOpacity>
        <MaterialCommunityIcons name="dog-side" size={32} color="#045b26" style={{ marginRight: 12 }} />
        <Text style={styles.title}>Owner's Responsibility</Text>
      </View>
      {/* Responsibilities List */}
      <View style={styles.responsibilityBox}>
        {responsibilities.map((item, idx) => (
          <View key={idx} style={styles.responsibilityItem}>
            <Text style={styles.responsibilityNumber}>{idx + 1}.</Text>
            <Text style={styles.responsibilityText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#045b26',
  },
  responsibilityBox: {
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    padding: 18,
    elevation: 2,
  },
  responsibilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  responsibilityNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginRight: 10,
    marginTop: 2,
  },
  responsibilityText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
}); 