import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#045b26',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  capturedImage: {
    width: 300,
    height: 300,
    borderRadius: 20,
    backgroundColor: '#b6e2b6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  imagePlaceholder: {
    width: 280,
    height: 280,
    borderRadius: 16,
    backgroundColor: '#e0ffe6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#045b26',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 40,
  },
  actionButton: {
    backgroundColor: '#D37F52',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

interface IntegrationImageResultPageProps {
  onRetake: () => void;
  onSeeResult: () => void;
  capturedImage?: string | null;
}

export default function IntegrationImageResultPage({ onRetake, onSeeResult, capturedImage }: IntegrationImageResultPageProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Captured Image */}
        <View style={styles.imageContainer}>
          <View style={styles.capturedImage}>
            {capturedImage ? (
              <Image 
                source={{ uri: capturedImage }} 
                style={styles.imagePlaceholder}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="pets" size={64} color="#045b26" />
                <Text style={styles.placeholderText}>Pet Photo</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={onRetake}>
            <Text style={styles.buttonText}>Take another picture</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onSeeResult}>
            <Text style={styles.buttonText}>See Result</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
} 