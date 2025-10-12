import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Modal, Pressable, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken } from '../../utils/auth.utils';
import { API_BASE_URL } from '../../utils/config';


interface IntegrationPicturePageProps {
  onResult: (result: string, imageUri?: string) => void;
  onStartScan: (imageUri: string) => void;
  onBack?: () => void;
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
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  introTitle: {
    color: '#045b26',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  introText: {
    color: '#4a7c59',
    fontSize: 13,
    lineHeight: 18,
  },
  headerText: {
    color: '#D37F52',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    lineHeight: 22,
    textAlign: 'left',
    marginLeft: 8,
  },
  section: {
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    color: '#045b26',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  exampleImage: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#045b26',
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: -8,
  },
  takePhotoButton: {
    width: 110,
    height: 110,
    borderRadius: 100,
    backgroundColor: '#D37F52',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  buttonIconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  pawIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  takePhotoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D37F52',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 4,
    minWidth: 160,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  libraryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scanBox: {
    width: 320,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  scanTitle: {
    color: '#045b26',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanSubtitle: {
    color: '#4a7c59',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  scanProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scanProgressFill: {
    height: '100%',
    backgroundColor: '#D37F52',
  },
  scanSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  scanStep: {
    flex: 1,
    alignItems: 'center',
  },
  scanStepActive: {
    opacity: 1,
  },
  scanStepText: {
    color: '#6b7f70',
    fontSize: 12,
    marginTop: 4,
  },
  // Error Modal Styles (matching Integration Page modal)
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorModalBox: {
    width: 340,
    backgroundColor: 'rgba(240, 248, 240, 0.95)',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    elevation: 10,
    zIndex: 100,
    position: 'relative',
  },
  errorCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  errorModalPrompt: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 28,
    textAlign: 'center',
  },
  errorModalButton: {
    width: 140,
    height: 48,
    backgroundColor: '#045b26',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    elevation: 2,
    zIndex: 1,
  },
  errorModalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

const dos = [
  'Make sure your cat\'s face is clearly visible.',
  'Take the photo in good lighting—avoid shadows.',
  'Ensure your cat is calm and facing the camera.',
  'Avoid covering any part of the cat\'s face.',
  'Take the photo at eye level for best results.',
];

const donts = [
  'Don\'t take a picture of your cat when its face is obstructed or partially out of the frame.',
  'Don\'t use a flash or take photos in dim lighting, as this can create harsh shadows and scare your cat.',
  'Don\'t try to take a picture of your cat if they are moving, stressed, or not looking at the camera.',
  'Don\'t take the photo from a high angle (looking down) or a very low angle (looking up).',
  'Don\'t upload photos of dogs or other animals - only cats are supported for this assessment.',
];

export default function IntegrationPicturePage({ onResult, onStartScan, onBack }: IntegrationPicturePageProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPetType, setSelectedPetType] = useState<string>('');

  // Debug log to verify new design is loaded
  console.log('IntegrationPicturePage: New design loaded with Do\'s and Don\'ts');

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Get the selected pet type from local storage
      try {
        const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
        if (assessmentDataString) {
          const assessmentData = JSON.parse(assessmentDataString);
          setSelectedPetType(assessmentData.pet_type || '');
          console.log('Selected pet type:', assessmentData.pet_type);
        }
      } catch (error) {
        console.error('Error reading assessment data:', error);
      }
    })();
  }, []);

  // No uploads or analysis here; scanning happens on a dedicated page

  const handleImageSelection = async (source: 'camera' | 'library') => {
    if (source === 'camera' && hasPermission === null) {
      alert('Camera permission is required to take photos.');
      return;
    }
    
    if (source === 'camera' && hasPermission === false) {
      alert('Camera permission is required to take photos.');
      return;
    }

    // No inline scanning; navigation to scanning screen

    try {
      const options = {
        mediaTypes: 'images' as any,
        allowsEditing: true, // allow user to crop before analysis
        quality: 1.0, // keep highest quality to aid detection
      } as any;

      const result = source === 'camera' 
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets[0]) {
        const photo = result.assets[0];

        const formData = new FormData();
        formData.append('file', {
            uri: photo.uri,
            name: 'cat_photo.jpg',
            type: 'image/jpeg',
        } as any);

                    console.log('Sending image:', `${API_BASE_URL}/predict-eld`);
        console.log('Image URI:', photo.uri);
        console.log('Selected pet type:', selectedPetType);
        console.log('API_BASE_URL:', API_BASE_URL);

        // Validate that we're processing the correct pet type
        const normalizedPetType = selectedPetType?.toUpperCase();
        console.log('Normalized pet type:', normalizedPetType);
        
        if (normalizedPetType === 'CAT') {
          console.log('Processing cat image for pain assessment...');
        } else if (normalizedPetType === 'DOG') {
          console.log('Processing dog image - this should not happen in cat assessment flow');
          setErrorMessage('You selected DOG but this is the cat assessment flow. Please go back and select CAT.');
          setErrorModalVisible(true);
          return;
        } else {
          console.log('Unknown pet type:', selectedPetType, '(normalized:', normalizedPetType, ')');
          setErrorMessage('Pet type not recognized. Please go back and select CAT or DOG.');
          setErrorModalVisible(true);
          return;
        }
        // Navigate to scanning page and let it handle processing
        
        onStartScan(photo.uri);
        return;
      }
    } catch (error) {
      console.error('Image selection error:', error);
      setErrorMessage('Failed to select image. Please try again.');
      setErrorModalVisible(true);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text style={styles.listText}>No access to camera</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introCard}>
          <MaterialIcons name="photo-camera" size={20} color="#045b26" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Photo assessment</Text>
            <Text style={styles.introText}>Follow the do's and don'ts, then capture or choose a clear cat face photo.</Text>
          </View>
        </View>



        {/* Do's Section */}
        <View style={[styles.section, styles.card]}>
          <Text style={styles.sectionTitle}>Do's</Text>
          
          {/* Example Images */}
          <View style={styles.imageRow}>
            <Image 
              source={require('../../assets/images/caine_facingcam.jpg')} 
              style={styles.exampleImage}
              resizeMode="cover"
              onError={(error) => console.log('Image 1 error:', error)}
            />
            <Image 
              source={require('../../assets/images/2canine_facingcam.jpg')} 
              style={styles.exampleImage}
              resizeMode="cover"
              onError={(error) => console.log('Image 2 error:', error)}
            />
          </View>

          {/* Do's List */}
          {dos.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <MaterialIcons name="check-circle" size={16} color="#4CAF50" style={styles.listIcon} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Don'ts Section */}
        <View style={[styles.section, styles.card]}>
          <Text style={styles.sectionTitle}>Don'ts</Text>
          
          {/* Example Images */}
          <View style={styles.imageRow}>
            <Image 
              source={require('../../assets/images/1dont_canine.jpg')} 
              style={styles.exampleImage}
              resizeMode="cover"
              onError={(error) => console.log('Image 3 error:', error)}
            />
            <Image 
              source={require('../../assets/images/2dont_canine.jpg')} 
              style={styles.exampleImage}
              resizeMode="cover"
              onError={(error) => console.log('Image 4 error:', error)}
            />
          </View>

          {/* Don'ts List */}
          {donts.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <MaterialIcons name="cancel" size={16} color="#F44336" style={styles.listIcon} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Take Photo Button */}
          <TouchableOpacity 
            style={styles.takePhotoButton} 
            onPress={() => handleImageSelection('camera')}
            activeOpacity={0.9}
          >
            <View style={styles.buttonIconContainer}>
              <MaterialIcons name="camera-alt" size={24} color="#fff" />
              <MaterialIcons name="pets" size={16} color="#fff" style={styles.pawIcon} />
            </View>
            <Text style={styles.takePhotoText}>Take Cat Photo</Text>
          </TouchableOpacity>

          {/* Choose from Library Button */}
          <TouchableOpacity 
            style={styles.libraryButton} 
            onPress={() => handleImageSelection('library')}
            activeOpacity={0.9}
          >
            <MaterialIcons name="photo-library" size={20} color="#fff" />
            <Text style={styles.libraryButtonText}>Choose cat photo from Library</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* No inline animation here; scanning happens in a dedicated page */}

      {/* Error Modal */}
      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.errorModalOverlay}>
          <View style={styles.errorModalBox}>
            <TouchableOpacity 
              style={styles.errorCloseButton}
              onPress={() => setErrorModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={[styles.errorModalPrompt, { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#D37F52' }]}>
              {errorMessage.split('\n')[0]}
            </Text>
            {errorMessage.split('\n').slice(1).map((line, index) => (
              <Text key={index} style={[styles.errorModalPrompt, { fontSize: 14, fontWeight: 'normal', marginBottom: 8, textAlign: 'center', color: '#666' }]}>
                {line}
              </Text>
            ))}
            <Text style={[styles.errorModalPrompt, { fontSize: 12, fontWeight: 'normal', marginBottom: 20, textAlign: 'center', color: '#999' }]}>
              The model requires a clear photo of a cat's face to detect 48 landmarks for accurate pain assessment.
            </Text>
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.errorModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 