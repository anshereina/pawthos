import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function UpcomingVaccinationPage({ onBack }: { onBack?: () => void }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack || (() => {})} style={{marginRight: 8}}>
          <MaterialIcons name="chevron-left" size={32} color="#045b26" />
        </TouchableOpacity>
        <MaterialCommunityIcons name="calendar-check-outline" size={32} color="#000" style={{ marginRight: 12 }} />
        <Text style={styles.title}>Upcoming Vaccination</Text>
      </View>
      {/* Event Notification Box */}
      <View style={styles.notificationBox}>
        <View style={styles.iconCol}>
          <MaterialCommunityIcons name="needle" size={28} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle}>Free Vaccination</Text>
          <Text style={styles.eventDetail}> Every Wednesday(9 AM)</Text>
          <Text style={styles.reminder}>Reminder: Bring your Pet VaciCard or Ready your PawThas App.</Text>
        </View>
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
    marginBottom: 4,
  },
  eventDetail: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 4,
  },
  reminder: {
    color: '#fff',
    fontSize: 15,
    fontStyle: 'italic',
  },
}); 