import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { getScheduledVaccinationEvents, VaccinationEvent } from '../../utils/vaccination.utils';

export default function UpcomingVaccinationPage({ onBack }: { onBack?: () => void }) {
  const [vaccinationEvents, setVaccinationEvents] = useState<VaccinationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVaccinationEvents();
  }, []);

  const loadVaccinationEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getScheduledVaccinationEvents();
      
      if (result.success && result.data) {
        setVaccinationEvents(result.data);
      } else {
        setError(result.message || 'Failed to load vaccination events');
        Alert.alert('Error', result.message || 'Failed to load vaccination events');
      }
    } catch (error) {
      console.error('Error loading vaccination events:', error);
      setError('Failed to load vaccination events');
      Alert.alert('Error', 'Failed to load vaccination events');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack || (() => {})} style={{marginRight: 8}}>
          <MaterialIcons name="chevron-left" size={32} color="#045b26" />
        </TouchableOpacity>
        <MaterialCommunityIcons name="calendar-check-outline" size={32} color="#000" style={{ marginRight: 12 }} />
        <Text style={styles.title}>Vaccination </Text>
      </View>
      

      {/* Upcoming Vaccination Notification Boxes */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading vaccination events...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadVaccinationEvents}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : vaccinationEvents.length > 0 ? (
        vaccinationEvents.map((event) => (
          <View key={event.id} style={styles.upcomingNotificationBox}>
            <View style={styles.iconCol}>
              <MaterialCommunityIcons name="calendar-clock" size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.upcomingTitle}>UPCOMING VACCINATION</Text>
                             <View style={styles.eventInfo}>
                 <Text style={styles.eventInfoLabel}>Title:</Text>
                 <Text style={styles.eventInfoValue}>{event.event_title}</Text>
               </View>
               <View style={styles.eventInfo}>
                 <Text style={styles.eventInfoLabel}>Location:</Text>
                 <Text style={styles.eventInfoValue}>{event.barangay}</Text>
               </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventInfoLabel}>Event Date:</Text>
                <Text style={styles.eventInfoValue}>{formatDate(event.event_date)}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No upcoming vaccination events scheduled</Text>
        </View>
      )}
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
  iconCol: {
    marginRight: 14,
    marginTop: 2,
  },
  upcomingNotificationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  upcomingTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 8,
  },
  eventInfo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  eventInfoLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    width: 90,
  },
  eventInfoValue: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 