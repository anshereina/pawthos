import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const retrievalGuidelines = [
  'Strict Retrieval Deadline: There is a limited timeframe of three calendar days from the date the dog was impounded to retrieve it. The facility may not be able to hold the dog beyond this period.',
  'Immediate Release After Payment: The dog will be released without delay once the required retrieval fee has been paid in full.',
  'Proof of Ownership: To ensure the dog is returned to the correct owner, proof of ownership is required. Acceptable examples include vet records, a microchip number, or photos of the owner with their dog.',
  'Operating Hours: It is important to check the operating hours of the retrieval facility to ensure arrival during open times.',
  'Accepted Payment Methods: Before visiting, it is advised to inquire about the accepted forms of payment, such as cash, credit card, or mobile payment, to prevent any inconvenience.'
];

export default function RetrieveDogPage({ onBack }: { onBack?: () => void }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack || (() => {})} style={{marginRight: 8}}>
          <MaterialIcons name="chevron-left" size={32} color="#045b26" />
        </TouchableOpacity>
        <MaterialCommunityIcons name="dog" size={32} color="#045b26" style={{ marginRight: 12 }} />
        <Text style={styles.title}>How to Retrieve Your Dog</Text>
      </View>
      {/* Guidelines List */}
      <View style={styles.guidelinesBox}>
        {retrievalGuidelines.map((item, idx) => (
          <View key={idx} style={styles.guidelineItem}>
            <Text style={styles.guidelineNumber}>{idx + 1}.</Text>
            <Text style={styles.guidelineText}>{item}</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#045b26',
  },
  guidelinesBox: {
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    padding: 18,
    elevation: 2,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  guidelineNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginRight: 10,
    marginTop: 2,
  },
  guidelineText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
}); 