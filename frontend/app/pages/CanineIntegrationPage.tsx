import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function CanineIntegrationPage({ onSelect }: { onSelect: (label: string) => void }) {
  const [showGuidance, setShowGuidance] = useState(false);

  const handleNext = () => {
    onSelect('CanineGuidelineIntegration');
  };

  const handleBack = () => {
    onSelect('Integration');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <MaterialIcons name="arrow-back" size={24} color="#045b26" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dog's Pain Assessment</Text>
        </View>

        {/* BEAAP Acronym Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BEAAP Assessment Method</Text>
          <Text style={styles.sectionDescription}>
            Our assessment tool helps you communicate your observations more effectively to your veterinarian using the BEAAP method:
          </Text>
          
                     <View style={styles.acronymContainer}>
             <View style={styles.acronymItem}>
               <Text style={styles.acronymLetter}>B</Text>
               <Text style={styles.acronymText}>Breathing</Text>
             </View>
             <View style={styles.acronymItem}>
               <Text style={styles.acronymLetter}>E</Text>
               <Text style={styles.acronymText}>Eyes</Text>
             </View>
             <View style={styles.acronymItem}>
               <Text style={styles.acronymLetter}>A</Text>
               <Text style={styles.acronymText}>Ambulation</Text>
             </View>
             <View style={styles.acronymItem}>
               <Text style={styles.acronymLetter}>A</Text>
               <Text style={styles.acronymText}>Activity</Text>
             </View>
             <View style={styles.acronymItem}>
               <Text style={styles.acronymLetter}>A</Text>
               <Text style={styles.acronymText}>Appetite</Text>
             </View>
             <View style={styles.acronymItem}>
               <Text style={styles.acronymLetter}>A</Text>
               <Text style={styles.acronymText}>Attitude</Text>
             </View>
             <View style={styles.acronymItem}>
               <Text style={styles.acronymLetter}>P</Text>
               <Text style={styles.acronymText}>Posture</Text>
             </View>
             <View style={styles.acronymItem}>
               <Text style={styles.acronymLetter}>P</Text>
               <Text style={styles.acronymText}>Palpation</Text>
             </View>
           </View>
            
            {/* Detailed BEAAP Descriptions */}
            <View style={styles.descriptionsContainer}>
              <View style={styles.descriptionItem}>
                <Text style={styles.descriptionLetter}>B:</Text>
                <Text style={styles.descriptionText}>
                  <Text style={styles.descriptionLabel}>Breathing</Text> - Look for changes like panting, fast breathing, or labored breathing.
                </Text>
              </View>
              
              <View style={styles.descriptionItem}>
                <Text style={styles.descriptionLetter}>E:</Text>
                <Text style={styles.descriptionText}>
                  <Text style={styles.descriptionLabel}>Eyes</Text> - Note if their eyes are dull, worried, or panicked instead of bright and alert.
                </Text>
              </View>
              
              <View style={styles.descriptionItem}>
                <Text style={styles.descriptionLetter}>A:</Text>
                <Text style={styles.descriptionText}>
                  <Text style={styles.descriptionLabel}>Ambulation</Text> - Check for limping, slowness in getting up or lying down, or refusal to put weight on a leg.
                </Text>
              </View>
              
              <View style={styles.descriptionItem}>
                <Text style={styles.descriptionLetter}>A:</Text>
                <Text style={styles.descriptionText}>
                  <Text style={styles.descriptionLabel}>Activity</Text> - Watch for a loss of interest in playing or engaging with family.
                </Text>
              </View>
              
              <View style={styles.descriptionItem}>
                <Text style={styles.descriptionLetter}>A:</Text>
                <Text style={styles.descriptionText}>
                  <Text style={styles.descriptionLabel}>Appetite</Text> - See if their eating and drinking habits have changed.
                </Text>
              </View>
              
              <View style={styles.descriptionItem}>
                <Text style={styles.descriptionLetter}>A:</Text>
                <Text style={styles.descriptionText}>
                  <Text style={styles.descriptionLabel}>Attitude</Text> - Observe if they are subdued, anxious, restless, or aggressive.
                </Text>
              </View>
              
              <View style={styles.descriptionItem}>
                <Text style={styles.descriptionLetter}>P:</Text>
                <Text style={styles.descriptionText}>
                  <Text style={styles.descriptionLabel}>Posture</Text> - Look for physical changes like a tucked tail, arched back, or abnormal weight distribution.
                </Text>
              </View>
              
              <View style={styles.descriptionItem}>
                <Text style={styles.descriptionLetter}>P:</Text>
                <Text style={styles.descriptionText}>
                  <Text style={styles.descriptionLabel}>Palpation</Text> - Notice how they react when you touch them.
                </Text>
              </View>
                         </View>
         </View>

                   {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 10,
    zIndex: 10,
  },
  headerTitle: {
    color: '#D37F52',
    fontSize: 25,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerText: {
    color: '#D37F52',
    fontSize: 23,
    fontWeight: 'bold',
    flex: 1,
    lineHeight: 22,
    textAlign: 'left',
    marginLeft: -1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#045b26',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
  },
  sectionDescription: {
    color: '#4a7c59',
    fontSize: 12,
    lineHeight: 12,
    marginBottom: 16,
    textAlign: 'left',
  },
  acronymContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 13,
  },
  acronymItem: {
    alignItems: 'center',
    marginBottom: 16,
    width: '22%',
  },
  acronymLetter: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D37F52',
    backgroundColor: '#f0f0f0',
    width: 40,
    height: 40,
    borderRadius: 20,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 8,
  },
  acronymText: {
    fontSize: 10,
    color: '#045b26',
    fontWeight: '500',
    textAlign: 'center',
  },
  descriptionsContainer: {
    marginTop: 20,
  },
  descriptionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  descriptionLetter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D37F52',
    marginRight: 8,
    marginTop: 2,
  },
  descriptionText: {
    flex: 1,
    color: '#4a7c59',
    fontSize: 14,
    lineHeight: 20,
  },
  descriptionLabel: {
    fontWeight: 'bold',
    color: '#045b26',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  listIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    color: '#4a7c59',
    fontSize: 14,
    lineHeight: 20,
  },
  listLabel: {
    fontWeight: 'bold',
    color: '#045b26',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: -20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D37F52',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    elevation: 4,
    minWidth: 180,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    textAlign: 'center',
  },
});
