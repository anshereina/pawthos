import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePainAssessment } from '../../utils/painAssessments.utils';

const DOG_QUESTIONS = [
  'My dog is licking at one area obsessively',
  "My dog's appetite has decreased",
  'My dog does not get up to greet me any longer',
  'My dog sleeps more',
  'My dog is restless at night',
  'My dog does not want to go for walks any more or lags behind on walks',
  'My dog has always been housebroken, but now is having accidents in the house',
  'My dog does not want to be touched or pet',
  'My dog is newly reactive or aggressive toward people or other animals',
];

const DOG_ASSESSMENT_QUESTIONS = [
  'My dog pants a lot, even at rest',
  "My dog's coat seems dull, and the hair stands up in places",
  'My dog no longer wants to be held or picked up',
  'My dog is reclusive and hiding/My dog\'s back is hunched',
  'My dog does not want to turn his head or move his neck',
  'My dog is whimpering, moaning or yelping',
];

const CAT_QUESTIONS = [
  'My cat shows less desire to interact with people or animals (hides, resists being petted, brushed, held, or picked up).',
  'My cat excessively licks, bites, or scratches a specific body part.',
  'My cat sleeps in an unusual position or location.',
  'My cat shows unusual aggression when approached or touched (biting, hissing, ears pinned back).',
  "My cat's eye expression has changed (staring, enlarged pupils, vacant look, or squinting).",
  'My cat has stopped using or has difficulty getting in or out of the litter box.',
  'My cat has stopped grooming completely or avoids grooming certain areas.',
];

const PAW_WATERMARK_SIZE = 260;

export default function IntegrationQuestionsPage({ petType, onBack, onNext }) {
  const questions = petType === 'dog' ? DOG_QUESTIONS : CAT_QUESTIONS;
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentAnswers, setAssessmentAnswers] = useState(Array(DOG_ASSESSMENT_QUESTIONS.length).fill(null));

  const handleAnswer = (idx, value) => {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? value : a)));
  };

  const handleAssessmentAnswer = (idx, value) => {
    setAssessmentAnswers((prev) => prev.map((a, i) => (i === idx ? value : a)));
  };

  // Check if all questions are answered
  const areAllQuestionsAnswered = () => {
    const currentAnswers = showAssessment ? assessmentAnswers : answers;
    return currentAnswers.every(answer => answer !== null);
  };

  const handleNext = async () => {
    // Check if all questions are answered
    const currentAnswers = showAssessment ? assessmentAnswers : answers;
    const allAnswered = currentAnswers.every(answer => answer !== null);
    
    if (!allAnswered) {
      // Show alert or some indication that all questions must be answered
      Alert.alert('Incomplete', 'Please answer all questions before proceeding.');
      return;
    }
    
    if (petType === 'dog' && !showAssessment) {
      setShowAssessment(true);
    } else if (petType === 'dog' && showAssessment) {
      // Save answers to database before proceeding
      await saveAnswersToDatabase();
      onNext(); // This will navigate to Integration Picture Page
    } else {
      // Save answers to database before proceeding
      await saveAnswersToDatabase();
      onNext();
    }
  };

  const saveAnswersToDatabase = async () => {
    try {
      const assessmentId = await AsyncStorage.getItem('currentAssessmentId');
      if (!assessmentId) {
        console.error('No assessment ID found');
        return;
      }

      // Prepare answers data
      const answersData = {
        basic_answers: answers,
        assessment_answers: petType === 'dog' ? assessmentAnswers : null,
        questions_completed: true
      };

      // Update the assessment with answers
      const result = await updatePainAssessment(parseInt(assessmentId), {
        basic_answers: JSON.stringify(answers),
        assessment_answers: petType === 'dog' ? JSON.stringify(assessmentAnswers) : null,
        questions_completed: true,
        recommendations: `Assessment completed. Basic answers: ${answers.filter(a => a === true).length}/${answers.length} positive. ${petType === 'dog' ? `Assessment answers: ${assessmentAnswers.filter(a => a === true).length}/${assessmentAnswers.length} positive.` : ''}`
      });

      if (!result.success) {
        console.error('Failed to save answers:', result.message);
      } else {
        console.log('Answers saved successfully');
      }
    } catch (error) {
      console.error('Error saving answers:', error);
    }
  };

  const handleBack = () => {
    if (showAssessment) {
      setShowAssessment(false);
      setAssessmentAnswers(Array(DOG_ASSESSMENT_QUESTIONS.length).fill(null));
    } else {
      onBack();
    }
  };

  if (showAssessment && petType === 'dog') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Watermark */}
        <View style={styles.watermarkContainer} pointerEvents="none">
          <View style={styles.pawWatermark}>
            <FontAwesome5 name="paw" size={180} color="#b6e2b6" style={{ opacity: 0.18 }} />
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
          <Text style={styles.title}>
            {petType === 'dog' ? 'Pain Assessment for Dogs' : 'Pain Assessment for Cats'}
          </Text>
          <Text style={styles.instructions}>Check yes or no for each of the following</Text>
          
          {/* Table header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }} />
            <Text style={styles.headerCol}>YES</Text>
            <Text style={styles.headerCol}>NO</Text>
          </View>
          
          {/* Assessment Questions */}
          {DOG_ASSESSMENT_QUESTIONS.map((q, idx) => (
            <View key={q} style={styles.questionRow}>
              <Text style={styles.questionText}>{q}</Text>
              <TouchableOpacity
                style={[styles.checkbox, assessmentAnswers[idx] === true && styles.checkboxChecked]}
                onPress={() => handleAssessmentAnswer(idx, true)}
              >
                {assessmentAnswers[idx] === true && <View style={styles.checkboxInner} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.checkbox, assessmentAnswers[idx] === false && styles.checkboxChecked]}
                onPress={() => handleAssessmentAnswer(idx, false)}
              >
                {assessmentAnswers[idx] === false && <View style={styles.checkboxInner} />}
              </TouchableOpacity>
            </View>
          ))}
          
          {/* Navigation buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.navButton} onPress={handleBack}>
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.navButton, 
                !areAllQuestionsAnswered() && styles.navButtonDisabled
              ]} 
              onPress={handleNext}
              disabled={!areAllQuestionsAnswered()}
            >
              <Text style={[
                styles.navButtonText,
                !areAllQuestionsAnswered() && styles.navButtonTextDisabled
              ]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Watermark */}
              <View style={styles.watermarkContainer} pointerEvents="none">
          <View style={styles.pawWatermark}>
            <FontAwesome5 name="paw" size={180} color="#b6e2b6" style={{ opacity: 0.18 }} />
          </View>
        </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <Text style={styles.title}>
          {petType === 'dog' ? 'Pain Assessment for Dogs' : 'Pain Assessment for Cats'}
        </Text>
        <Text style={styles.instructions}>Check yes or no for each of the following</Text>
        {/* Table header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }} />
          <Text style={styles.headerCol}>YES</Text>
          <Text style={styles.headerCol}>NO</Text>
        </View>
        {/* Questions */}
        {questions.map((q, idx) => (
          <View key={q} style={styles.questionRow}>
            <Text style={styles.questionText}>{q}</Text>
            <TouchableOpacity
              style={[styles.checkbox, answers[idx] === true && styles.checkboxChecked]}
              onPress={() => handleAnswer(idx, true)}
            >
              {answers[idx] === true && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.checkbox, answers[idx] === false && styles.checkboxChecked]}
              onPress={() => handleAnswer(idx, false)}
            >
              {answers[idx] === false && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
          </View>
        ))}
        {/* Navigation buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.navButton} onPress={onBack}>
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.navButton, 
              !areAllQuestionsAnswered() && styles.navButtonDisabled
            ]} 
            onPress={handleNext}
            disabled={!areAllQuestionsAnswered()}
          >
            <Text style={[
              styles.navButtonText,
              !areAllQuestionsAnswered() && styles.navButtonTextDisabled
            ]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#045b26',
  },
  watermarkContainer: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0,
  },
  pawWatermark: {
    width: PAW_WATERMARK_SIZE,
    height: PAW_WATERMARK_SIZE,
    borderRadius: PAW_WATERMARK_SIZE / 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: '#D37F52',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 12,
  },
  instructions: {
    fontSize: 18,
    color: '#b6e2b6',
    textAlign: 'center',
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  headerCol: {
    width: 48,
    color: '#b6e2b6',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  questionText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#b6e2b6',
    borderRadius: 6,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    borderColor: '#D37F52',
  },
  checkboxInner: {
    width: 16,
    height: 16,
    backgroundColor: '#D37F52',
    borderRadius: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#D37F52',
    borderRadius: 16,
    marginHorizontal: 8,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 2,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  navButtonTextDisabled: {
    color: '#999',
  },
}); 