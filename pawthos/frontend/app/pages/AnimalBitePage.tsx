import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function AnimalBitePage({ onBack }: { onBack?: () => void }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack || (() => {})} style={{marginRight: 8}}>
          <MaterialIcons name="chevron-left" size={32} color="#045b26" />
        </TouchableOpacity>
        <MaterialCommunityIcons name="dog" size={32} color="#045b26" style={{ marginRight: 12 }} />
        <Text style={styles.title}>Animal Bite</Text>
      </View>
      {/* Info Box */}
      <View style={styles.infoBox}>
        {/* Rabies in Man Section */}
        <Text style={styles.sectionTitle}>1. RABIES IN MAN</Text>
        <Text style={styles.sectionText}><Text style={{fontWeight:'bold'}}>Definition:</Text> Rabies is a fatally disease caused by a virus from the saliva of an infected animal.</Text>
        <Text style={styles.sectionText}><Text style={{fontWeight:'bold'}}>Symptoms:</Text> Hydrophobia, muscle pain, and paralysis.</Text>
        <Text style={styles.sectionText}><Text style={{fontWeight:'bold'}}>Transmission:</Text> The rabies virus is transmitted to humans in two primary ways:</Text>
        <Text style={styles.bulletText}>• Through a bite from an infected animal, most commonly a dog.</Text>
        <Text style={styles.bulletText}>• Through contamination of breaks in the skin or the mucous membranes of the eyes, lips, and mouth with virus-laden saliva.</Text>
        {/* When Bitten Section */}
        <Text style={[styles.sectionTitle, {marginTop: 18}]}>2. WHEN BITTEN BY A DOG</Text>
        <Text style={styles.sectionText}>1. <Text style={{fontWeight:'bold'}}>First Aid:</Text> Wash the wound immediately with soap and water.</Text>
        <Text style={styles.sectionText}>2. <Text style={{fontWeight:'bold'}}>Medical Attention:</Text> Consult a physician or call the nearest Animal Bite Center.</Text>
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
  infoBox: {
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    padding: 18,
    elevation: 2,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 6,
  },
  sectionText: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 4,
  },
  bulletText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 16,
    marginBottom: 2,
  },
}); 