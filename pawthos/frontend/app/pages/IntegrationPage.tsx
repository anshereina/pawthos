import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Pressable, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function IntegrationPage({ onSelect }: { onSelect: (label: string) => void }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [selectedRegisteredPet, setSelectedRegisteredPet] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPressed, setDropdownPressed] = useState(false);
  
  // In real app, this would be fetched from your database
  const [registeredPets, setRegisteredPets] = useState<any[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  
  // Function to fetch registered pets from API
  const fetchRegisteredPets = async () => {
    console.log('fetchRegisteredPets called');
    try {
      setLoadingPets(true);
      
      // Get auth token from storage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        setRegisteredPets([]);
        return;
      }
      
      const response = await fetch('http://192.168.1.8:8001/api/pets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const pets = await response.json();
        console.log('API call successful, pets received:', pets.length);
        console.log('All pets from API:', pets.map((pet: any) => ({ name: pet.name, species: pet.species })));
        console.log('Selected pet type:', selectedPet);
        
        // Filter pets based on selected pet type (cat/dog)
        const filteredPets = pets.filter((pet: any) => {
          const petSpecies = pet.species.toLowerCase();
          console.log(`Checking pet ${pet.name}: species="${pet.species}" (lowercase: "${petSpecies}")`);
          
          if (selectedPet === 'DOG') {
            // Show dogs - check for both "dog" and "canine"
            const isDog = petSpecies === 'dog' || petSpecies === 'canine';
            console.log(`  Is dog? ${isDog}`);
            return isDog;
          } else if (selectedPet === 'CAT') {
            // Show cats - check for both "cat" and "feline"
            const isCat = petSpecies === 'cat' || petSpecies === 'feline';
            console.log(`  Is cat? ${isCat}`);
            return isCat;
          }
          return true;
        });
        setRegisteredPets(filteredPets);
        console.log('Filtered pets for', selectedPet, ':', filteredPets);
        console.log('Current selectedRegisteredPet state:', selectedRegisteredPet);
        
        // If no pets found, show a helpful message
        if (filteredPets.length === 0 && pets.length > 0) {
          console.log('No pets matched the filter, but pets exist. Available species:', [...new Set(pets.map((p: any) => p.species))]);
          console.log(`You selected ${selectedPet} but only have pets with species: ${[...new Set(pets.map((p: any) => p.species))].join(', ')}`);
        }
      } else {
        console.error('Failed to fetch pets:', response.status, response.statusText);
        setRegisteredPets([]);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      setRegisteredPets([]);
    } finally {
      setLoadingPets(false);
    }
  };

  const handlePetSelect = async (pet: string) => {
    setSelectedPet(pet);
    
    // Store assessment data locally instead of creating in database
    const assessmentData = {
      pet_id: 1, // Default pet ID - will be updated when user selects specific pet
      pet_name: "Pet", // Default name - will be updated when user selects specific pet
      pet_type: pet,
      pain_level: "Pending Assessment",
      assessment_date: new Date().toISOString().split('T')[0],
      recommendations: "Assessment in progress...",
      basic_answers: null,
      assessment_answers: null,
      questions_completed: false
    };
    
    // Store the assessment data in AsyncStorage
    await AsyncStorage.setItem('currentAssessmentData', JSON.stringify(assessmentData));
    console.log('Assessment data stored locally:', assessmentData);
    
    setModalVisible(true);
  };

  const handleModalOption = async (option: string) => {
    console.log('Modal option clicked:', option);
    setModalVisible(false);
    
    if (option === 'No') {
      // Navigate directly to Integration Picture Page
      console.log('Navigating to IntegrationPicture');
      onSelect('IntegrationPicture');
    } else {
      // Fetch registered pets when "Yes" is clicked
      console.log('Fetching registered pets...');
      await fetchRegisteredPets();
      console.log('Setting showSecondModal to true');
      setTimeout(() => {
        console.log('Showing second modal');
        setSelectedRegisteredPet(null); // Reset selection when modal opens
        setShowSecondModal(true);
      }, 300); // slight delay for smooth transition
    }
  };

  const handleNext = async () => {
    setShowSecondModal(false);
    
    if (selectedRegisteredPet) {
      // Update the local assessment data with the selected pet's information
      try {
        const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
        console.log('Updating local assessment data with selected pet ID:', selectedRegisteredPet);
        
        if (assessmentDataString) {
          const assessmentData = JSON.parse(assessmentDataString);
          const selectedPetData = registeredPets.find(pet => pet.id === selectedRegisteredPet);
          console.log('Selected pet data:', selectedPetData);
          
          if (selectedPetData) {
            // Update the assessment data with the selected pet's details
            assessmentData.pet_id = selectedPetData.id;
            assessmentData.pet_name = selectedPetData.name;
            assessmentData.pet_type = selectedPetData.species === 'canine' ? 'Dog' : 'Cat';
            
            console.log('Updated assessment data:', assessmentData);
            
            // Store the updated assessment data back to AsyncStorage
            await AsyncStorage.setItem('currentAssessmentData', JSON.stringify(assessmentData));
            console.log('Successfully updated local assessment data with pet details');
          } else {
            console.error('Selected pet data not found for ID:', selectedRegisteredPet);
          }
        }
      } catch (error) {
        console.error('Error updating local assessment data with pet details:', error);
      }
    }
    
    setSelectedRegisteredPet(null);
    // Navigate to the correct integration questions page
    if (selectedPet === 'DOG') {
      onSelect('IntegrationQuestionsDog');
    } else if (selectedPet === 'CAT') {
      onSelect('IntegrationQuestionsCat');
    }
  };

  const getModalPrompt = () => {
    return selectedPet === 'DOG' ? "Select your registered Dog" : "Select your registered Cat";
  };

  const getDropdownPlaceholder = () => {
    return selectedPet === 'DOG' ? 'Choose a registered dog' : 'Choose a registered cat';
  };

  // Clear registered pets when pet type changes
  useEffect(() => {
    setRegisteredPets([]);
    setSelectedRegisteredPet(null);
  }, [selectedPet]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBorder} />
      <View style={styles.buttonContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.logo}>PawThos</Text>
          <Text style={styles.prompt}>What pet are you assessing?</Text>
        </View>
        <TouchableOpacity style={styles.petButton} onPress={() => handlePetSelect('DOG')}>
          <Text style={styles.buttonText}>DOG</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.petButton} onPress={() => handlePetSelect('CAT')}>
          <Text style={styles.buttonText}>CAT</Text>
        </TouchableOpacity>
      </View>
      {/* First Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalPrompt}>Pet already registered?</Text>
            <View style={styles.modalOptions}>
              <Pressable onPress={() => handleModalOption('Yes')} style={styles.modalOptionBtn}>
                <Text style={styles.modalOptionText}>Yes</Text>
              </Pressable>
              <Pressable onPress={() => handleModalOption('No')} style={styles.modalOptionBtn}>
                <Text style={styles.modalOptionText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Second Modal */}
      <Modal
        visible={showSecondModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSecondModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.secondModalBox}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSecondModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.secondModalPrompt}>{getModalPrompt()}</Text>
            <View style={styles.dropdownContainer}>
              <Pressable
                style={[
                  styles.dropdown,
                  dropdownPressed && styles.dropdownPressed
                ]}
                onPress={() => setDropdownOpen(!dropdownOpen)}
                onPressIn={() => setDropdownPressed(true)}
                onPressOut={() => setDropdownPressed(false)}
              >
                <MaterialIcons 
                  name={dropdownOpen ? "expand-less" : "expand-more"} 
                  size={28} 
                  color="#045b26" 
                  style={{ marginRight: 8 }} 
                />
                <Text style={[
                  styles.dropdownText,
                  !selectedRegisteredPet && styles.placeholderText
                ]}>
                  {selectedRegisteredPet && registeredPets.find(pet => pet.id === selectedRegisteredPet) ? 
                    registeredPets.find(pet => pet.id === selectedRegisteredPet)?.name : 
                    getDropdownPlaceholder()}
                </Text>
              </Pressable>
              {/* Dropdown list - only show when dropdown is open */}
              {dropdownOpen && (
                <View style={styles.dropdownList}>
                  {loadingPets ? (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownItemText}>Loading pets...</Text>
                    </View>
                  ) : registeredPets.length > 0 ? (
                    registeredPets.map((pet: any) => (
                      <Pressable
                        key={pet.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedRegisteredPet(pet.id);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{pet.name}</Text>
                      </Pressable>
                    ))
                  ) : (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownItemText}>
                        {loadingPets ? 'Loading pets...' : 'No registered pets found'}
                      </Text>
                      {!loadingPets && registeredPets.length === 0 && (
                        <Text style={[styles.dropdownItemText, { fontSize: 12, color: '#666', marginTop: 4 }]}>
                          You don't have any {selectedPet === 'DOG' ? 'dogs' : 'cats'} registered yet.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={[
                styles.nextButton, 
                !selectedRegisteredPet && styles.nextButtonDisabled
              ]} 
              onPress={handleNext}
              disabled={!selectedRegisteredPet}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // light white
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#045b26', // green line at top
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontFamily: 'IrishGrover',
    fontSize: 64,
    color: '#D37F52', // warm, brownish-orange color
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  prompt: {
    fontSize: 20,
    color: '#045b26', // green, sans-serif font
    fontFamily: 'sans-serif',
    marginBottom: 32,
    textAlign: 'center',
  },
  petButton: {
    width: 160,
    height: 48,
    backgroundColor: '#045b26', // dark green
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: 340,
    backgroundColor: 'rgba(240, 248, 240, 0.95)', 
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    zIndex: 100,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  modalPrompt: {
    fontSize: 18,
    color: '#000', // black - same as second modal
    fontWeight: 'bold',
    marginBottom: 28,
    textAlign: 'center',
  },
  modalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalOptionBtn: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#045b26', // dark green - same as appointment modal
    alignItems: 'center',
    maxWidth: 100,
  },
  modalOptionText: {
    color: '#fff', // white - same as appointment modal
    fontSize: 16,
    fontWeight: 'normal',
  },
  // Second modal styles
  secondModalBox: {
    width: 340,
    backgroundColor: 'rgba(240, 248, 240, 0.95)', // light green with reduced opacity
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    zIndex: 100,
    position: 'relative',
  },
  secondModalPrompt: {
    fontSize: 18,
    color: '#000', // black - same as appointment modal
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  nextButton: {
    width: 140,
    height: 30,
    backgroundColor: '#045b26', // dark green - same as appointment modal
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
    elevation: 2,
    zIndex: 1,
  },
  nextButtonText: {
    color: '#fff', // white - same as appointment modal
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  dropdownContainer: {
    position: 'relative',
    width: 240,
    marginBottom: 32,
    zIndex: 1000,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d0e6d0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    width: 240,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
  },
  dropdownPressed: {
    backgroundColor: '#c0d6c0',
    elevation: 1,
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
    fontStyle: 'italic',
  },
  dropdownList: {
    backgroundColor: '#d0e6d0',
    borderRadius: 16,
    width: 240,
    marginTop: 8,
    elevation: 6,
    zIndex: 1000,
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 18,
    color: '#000',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
}); 