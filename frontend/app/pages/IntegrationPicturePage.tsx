import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Image, Modal, Pressable, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken } from '../../utils/auth.utils';
import { API_BASE_URL } from '../../utils/config';


interface IntegrationPicturePageProps {
  onResult: (result: string, imageUri?: string) => void;
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
    marginTop: -20,
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
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 4,
    minWidth: 140,
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

export default function IntegrationPicturePage({ onResult, onBack }: IntegrationPicturePageProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const saveImageResultToLocalStorage = async (painLevel: string, imageUri: string) => {
    try {
      const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
      if (!assessmentDataString) {
        console.log('No assessment data found - this is normal for new assessments');
        return;
      }

      const assessmentData = JSON.parse(assessmentDataString);
      
      // Update the assessment data with the image and prediction result
      assessmentData.pain_level = painLevel;
      assessmentData.image_url = imageUri;
      assessmentData.recommendations = `AI Analysis Result: ${painLevel}. Image captured and analyzed successfully.`;

      // Store the updated assessment data back to AsyncStorage
      await AsyncStorage.setItem('currentAssessmentData', JSON.stringify(assessmentData));
      console.log('Image result saved to local storage successfully');
    } catch (error) {
      console.error('Error saving image result to local storage:', error);
    }
  };

  const handleImageSelection = async (source: 'camera' | 'library') => {
    if (source === 'camera' && hasPermission === null) {
      alert('Camera permission is required to take photos.');
      return;
    }
    
    if (source === 'camera' && hasPermission === false) {
      alert('Camera permission is required to take photos.');
      return;
    }

    setIsLoading(true);

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

        try {
          // Include auth token if available
          let headers: any = undefined;
          try {
            const token = await getAuthToken();
            if (token) {
              headers = { 'Authorization': `Bearer ${token}` };
            }
          } catch (e) {
            // Ignore missing token; /predict may not require auth
          }

          const response = await fetch(`${API_BASE_URL}/predict-eld`, {
            method: 'POST',
            headers,
            body: formData,
          });

          const result = await response.json();
          console.log('Response status:', response.status);
          console.log('Response result:', result);
          console.log('Response headers:', response.headers);

          // Navigate to the result page with the prediction and image
          if (response.ok) {
            // Save the image and prediction result to local storage
            await saveImageResultToLocalStorage(result.pain_level, photo.uri);
            
            // Log model results if diagnostic fields are present
            if (result && (result.model_type || result.landmarks_detected !== undefined)) {
              console.log('ELD Model Results:');
              console.log('- Model Type:', result.model_type || 'N/A');
              console.log('- Landmarks Detected:', result.landmarks_detected ?? 'N/A');
              console.log('- Expected Landmarks:', result.expected_landmarks ?? 'N/A');
              console.log('- Features Extracted:', result.features_extracted ?? 'N/A');
              console.log('- Confidence:', result.confidence ?? 'N/A');
            }
            
            onResult(result.pain_level, photo.uri);
          } else {

            // Provide more specific error messages based on the response
            let errorMsg = 'Unknown error occurred. Please try again.';

            // Endpoint not available on backend
            if (response.status === 404) {
              errorMsg = 'Prediction service is not available on the server. Please ensure the /api/predict-eld endpoint is enabled.';
            }

            if (result && result.detail) {
              const detail: string = String(result.detail);
              if (detail.includes('No Cat Face Detected')) {
                errorMsg = result.detail; // Use the exact message from backend
              } else if (detail.includes('too small')) {
                errorMsg = 'The detected cat face is too small for landmark detection. Please take a closer photo of the cat\'s face.';
              } else if (detail.includes('too large')) {
                errorMsg = 'The detected cat face is too large. Please take a photo with more context around the cat\'s face.';
              } else if (detail.includes('Failed to read image')) {
                errorMsg = 'Failed to process the image for landmark detection. Please try uploading a different photo.';
              } else if (detail.includes('Insufficient landmarks')) {
                errorMsg = 'The model could not detect enough landmarks (48 expected). Please ensure the cat\'s face is clearly visible and well-lit.';
              }
            }

            setErrorMessage(errorMsg);
            setErrorModalVisible(true);
          }
        } catch (error) {
          console.error('Network or other error:', error);
          setErrorMessage('Network error or server unavailable. Please check your connection and ensure the backend is running.');
          setErrorModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Image selection error:', error);
      setErrorMessage('Failed to select image. Please try again.');
      setErrorModalVisible(true);
    } finally {
      setIsLoading(false);
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
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack}
          >
            <MaterialIcons name="arrow-back" size={24} color="#045b26" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cat's Pain Assessment</Text>
        </View>



        {/* Do's Section */}
        <View style={styles.section}>
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
        <View style={styles.section}>
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
          >
            <MaterialIcons name="photo-library" size={20} color="#fff" />
            <Text style={styles.libraryButtonText}>Choose cat photo from Library</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D37F52" />
          <Text style={{ marginTop: 10, color: '#fff' }}>Analyzing...</Text>
        </View>
      )}

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