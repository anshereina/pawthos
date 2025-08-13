import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Image, Modal, Pressable, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePainAssessment } from '../../utils/painAssessments.utils';

interface IntegrationPicturePageProps {
  onResult: (result: string, imageUri?: string) => void;
  onBack?: () => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#045b26',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  backButton: {
    marginRight: 12,
    padding: 10,
    zIndex: 10,
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
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
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
    borderColor: '#fff',
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
    color: '#b6e2b6',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  takePhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D37F52',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D37F52',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 4,
  },
  libraryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
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
  'Make sure your pet\'s face is clearly visible.',
  'Take the photo in good lighting—avoid shadows.',
  'Ensure your pet is calm and facing the camera.',
  'Avoid covering any part of the face.',
  'Take the photo at eye level for best results.',
];

const donts = [
  'Don\'t take a picture of your cat when its face is obstructed or partially out of the frame.',
  'Don\'t use a flash or take photos in dim lighting, as this can create harsh shadows and scare your pet.',
  'Don\'t try to take a picture of your pet if they are moving, stressed, or not looking at the camera.',
  'Don\'t take the photo from a high angle (looking down) or a very low angle (looking up).',
];

export default function IntegrationPicturePage({ onResult, onBack }: IntegrationPicturePageProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Debug log to verify new design is loaded
  console.log('IntegrationPicturePage: New design loaded with Do\'s and Don\'ts');

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const saveImageResultToDatabase = async (painLevel: string, imageUri: string) => {
    try {
      const assessmentId = await AsyncStorage.getItem('currentAssessmentId');
      if (!assessmentId) {
        console.error('No assessment ID found');
        return;
      }

      // Update the assessment with the image and prediction result
      const result = await updatePainAssessment(parseInt(assessmentId), {
        pain_level: painLevel,
        image_url: imageUri,
        recommendations: `AI Analysis Result: ${painLevel}. Image captured and analyzed successfully.`
      });

      if (!result.success) {
        console.error('Failed to save image result:', result.message);
      } else {
        console.log('Image result saved successfully');
      }
    } catch (error) {
      console.error('Error saving image result:', error);
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
        allowsEditing: true,
        aspect: [1, 1] as [number, number],
        quality: 0.8,
      };

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

        console.log('Sending image to:', 'http://192.168.1.8:8001/api/predict');
        console.log('Image URI:', photo.uri);

        try {
          // Replace with your backend server IP address and port
          const response = await fetch('http://192.168.1.8:8001/api/predict', {
              method: 'POST',
              body: formData,
          });

          const result = await response.json();
          console.log('Response status:', response.status);
          console.log('Response result:', result);

          // Navigate to the result page with the prediction and image
          if (response.ok) {
            // Save the image and prediction result to database
            await saveImageResultToDatabase(result.pain_level, photo.uri);
            onResult(result.pain_level, photo.uri);
          } else {
            console.error('API Error:', result);
            setErrorMessage(result.detail || 'Unknown error');
            setErrorModalVisible(true);
          }
        } catch (error) {
          console.error('Network or other error:', error);
          setErrorMessage('Network error. Please check your connection and try again.');
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
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText} numberOfLines={2}>
            For the best results, take note of the following Do's and Don'ts.
          </Text>
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
            <Text style={styles.takePhotoText}>Take a Photo</Text>
          </TouchableOpacity>

          {/* Choose from Library Button */}
          <TouchableOpacity 
            style={styles.libraryButton} 
            onPress={() => handleImageSelection('library')}
          >
            <MaterialIcons name="photo-library" size={20} color="#fff" />
            <Text style={styles.libraryButtonText}>Choose photo from Library</Text>
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
            <Text style={styles.errorModalPrompt}>Image Analysis Error</Text>
            <Text style={[styles.errorModalPrompt, { fontSize: 14, fontWeight: 'normal', marginBottom: 20 }]}>
              {errorMessage}
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