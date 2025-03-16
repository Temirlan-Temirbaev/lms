import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { Button, Icon, Divider, Overlay } from '@rneui/themed';
import * as api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
// import DraggableFlatList from 'react-native-draggable-flatlist';

const { width } = Dimensions.get('window');

const TestScreen = ({ route, navigation }) => {
  const { testId } = route.params;
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { refreshUser } = useAuth();

  useEffect(() => {
    fetchTest();
  }, [testId]);

  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      handleSubmitTest();
    }

    return () => clearTimeout(timer);
  }, [timeLeft, timerActive]);

  const fetchTest = async () => {
    setLoading(true);
    try {
      const response = await api.getTest(testId);
      setTest(response.data);
      
      // Initialize answers array with nulls
      const initialAnswers = response.data.questions.map(() => null);
      setAnswers(initialAnswers);
      
      // Set timer
      setTimeLeft(response.data.timeLimit * 60);
      setTimerActive(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load test');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTest = async () => {
    // Check if all questions are answered
    const unansweredQuestions = answers.filter(answer => answer === null).length;
    if (unansweredQuestions > 0) {
      Alert.alert(
        'Incomplete Test',
        `You have ${unansweredQuestions} unanswered question(s). Are you sure you want to submit?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit Anyway', onPress: submitTest }
        ]
      );
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    setSubmitting(true);
    try {
      const response = await api.submitTest(testId, answers);
      await refreshUser();
      navigation.replace('TestResult', {
        results: response.data,
        testId: testId,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to submit test');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const renderMultipleChoiceQuestion = (question) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question.question}</Text>
      {question.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionContainer,
            answers[currentQuestionIndex] === option && styles.selectedOption,
          ]}
          onPress={() => handleAnswerSelect(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
          {answers[currentQuestionIndex] === option && (
            <Icon name="checkmark-circle" type="ionicon" size={20} color="#4F8EF7" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMatchingQuestion = (question) => {
    // Initialize answers if not already set
    const currentAnswers = answers[currentQuestionIndex] || Array(question.options.length).fill('');
    
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        <Text style={styles.instructionText}>Match each item on the left with its corresponding item on the right</Text>
        
        {question.options.map((option, index) => (
          <View key={index} style={styles.matchingItem}>
            <View style={styles.matchingLeftContainer}>
              <Text style={styles.matchingOption}>{option}</Text>
            </View>
            <Icon name="arrow-forward" type="ionicon" size={20} color="#666" />
            <View style={styles.matchingRightContainer}>
              <TextInput
                style={[
                  styles.matchingInput,
                  currentAnswers[index] ? styles.matchingInputFilled : null
                ]}
                placeholder="Enter match"
                value={currentAnswers[index]}
                onChangeText={(text) => {
                  const newMatches = [...currentAnswers];
                  newMatches[index] = text;
                  handleAnswerSelect(newMatches);
                }}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderOrderingQuestion = (question) => {
    const currentAnswer = answers[currentQuestionIndex] || [...question.options];
    
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        <Text style={styles.instructionText}>Drag items to reorder them</Text>
        <FlatList
          data={currentAnswer}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item, index }) => (
            <View style={styles.orderingItem}>
              <Text style={styles.orderingNumber}>{index + 1}</Text>
              <View style={styles.orderingContent}>
                <Text style={styles.orderingText}>{item}</Text>
              </View>
              <View style={styles.orderingControls}>
                <TouchableOpacity
                  disabled={index === 0}
                  onPress={() => {
                    if (index > 0) {
                      const newOrder = [...currentAnswer];
                      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                      handleAnswerSelect(newOrder);
                    }
                  }}
                >
                  <Icon
                    name="chevron-up"
                    type="ionicon"
                    size={24}
                    color={index === 0 ? '#ccc' : '#666'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={index === currentAnswer.length - 1}
                  onPress={() => {
                    if (index < currentAnswer.length - 1) {
                      const newOrder = [...currentAnswer];
                      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                      handleAnswerSelect(newOrder);
                    }
                  }}
                >
                  <Icon
                    name="chevron-down"
                    type="ionicon"
                    size={24}
                    color={index === currentAnswer.length - 1 ? '#ccc' : '#666'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        />
      </View>
    );
  };

  const renderFillInBlanksQuestion = (question) => {
    // Check if the question has multiple blanks by looking for _____ pattern
    const hasMultipleBlanks = (question.question.match(/_____/g) || []).length > 1;
    
    if (hasMultipleBlanks) {
      return renderMultipleFillInBlanksQuestion(question);
    } else {
      // Get the current answer or initialize with empty string
      const currentAnswer = answers[currentQuestionIndex] || '';
      
      return (
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          <Text style={styles.instructionText}>Fill in the blank with the appropriate word or phrase</Text>
          
          <View style={styles.fillBlanksContainer}>
            <TextInput
              style={styles.fillBlanksInput}
              placeholder="Type your answer here"
              value={currentAnswer}
              onChangeText={(text) => handleAnswerSelect(text)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <Text style={styles.fillBlanksHint}>
            Tip: Your answer should be a single word or short phrase
          </Text>
        </View>
      );
    }
  };

  const renderMultipleFillInBlanksQuestion = (question) => {
    // Initialize answers object if not already set
    const currentAnswers = answers[currentQuestionIndex] || {};
    
    // Split the question text by the blank placeholder
    const parts = question.question.split('_____');
    
    // Create an array of blank IDs based on the number of blanks
    const blankIds = Array.from({ length: parts.length - 1 }, (_, i) => `blank${i + 1}`);
    
    const handleBlankChange = (blankId, text) => {
      const newAnswers = { ...currentAnswers };
      newAnswers[blankId] = text;
      handleAnswerSelect(newAnswers);
    };
    
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Fill in the blanks with the appropriate words or phrases</Text>
        <Text style={styles.instructionText}>Complete the sentence with the correct words</Text>
        
        <View style={styles.multipleBlanksContainer}>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <Text style={styles.blankPartText}>{part}</Text>
              {index < parts.length - 1 && (
                <TextInput
                  style={styles.multipleBlankInput}
                  placeholder="Type here"
                  value={currentAnswers[`blank${index + 1}`] || ''}
                  onChangeText={(text) => handleBlankChange(`blank${index + 1}`, text)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            </React.Fragment>
          ))}
        </View>
        
        <Text style={styles.fillBlanksHint}>
          Tip: Pay attention to verb conjugations and agreements
        </Text>
      </View>
    );
  };

  const renderInputQuestion = (question) => {
    // Get the current answer or initialize with empty string
    const currentAnswer = answers[currentQuestionIndex] || '';
    
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        <Text style={styles.instructionText}>Type your answer in the field below</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputAnswer}
            placeholder="Type your answer here"
            value={currentAnswer}
            onChangeText={(text) => handleAnswerSelect(text)}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        
        <Text style={styles.inputHint}>
          Tip: Pay attention to spelling and accents
        </Text>
      </View>
    );
  };

  const renderCategoriesQuestion = (question) => {
    // Initialize answers if not already set
    const currentAnswers = answers[currentQuestionIndex] || {};
    
    // Get all categories from the correct answer structure
    const categories = Object.keys(question.correctAnswer);
    
    // Initialize categories in the current answer if they don't exist
    categories.forEach(category => {
      if (!currentAnswers[category]) {
        currentAnswers[category] = [];
      }
    });
    
    // Get all options that haven't been categorized yet
    const uncategorizedOptions = question.options.filter(option => {
      return !Object.values(currentAnswers).some(categoryItems => 
        categoryItems.includes(option)
      );
    });
    
    const handleAddToCategory = (option, category) => {
      const newAnswers = { ...currentAnswers };
      
      // Remove the option from any other category it might be in
      Object.keys(newAnswers).forEach(cat => {
        newAnswers[cat] = newAnswers[cat].filter(item => item !== option);
      });
      
      // Add the option to the selected category
      newAnswers[category] = [...newAnswers[category], option];
      
      handleAnswerSelect(newAnswers);
    };
    
    const handleRemoveFromCategory = (option, category) => {
      const newAnswers = { ...currentAnswers };
      newAnswers[category] = newAnswers[category].filter(item => item !== option);
      handleAnswerSelect(newAnswers);
    };
    
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        <Text style={styles.instructionText}>Drag or tap items to place them in the correct category</Text>
        
        {/* Uncategorized options */}
        <View style={styles.categoriesSection}>
          <Text style={styles.categoryTitle}>Available Items:</Text>
          <View style={styles.uncategorizedContainer}>
            {uncategorizedOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryItem}
                onPress={() => {
                  // Show a dialog to select which category to add this to
                  Alert.alert(
                    'Select Category',
                    `Add "${option}" to which category?`,
                    categories.map(category => ({
                      text: category,
                      onPress: () => handleAddToCategory(option, category)
                    }))
                  );
                }}
              >
                <Text style={styles.categoryItemText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Categories */}
        {categories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categoriesSection}>
            <Text style={styles.categoryTitle}>{category}:</Text>
            <View style={styles.categoryContainer}>
              {currentAnswers[category].map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.categoryItem}
                  onPress={() => handleRemoveFromCategory(item, category)}
                >
                  <Text style={styles.categoryItemText}>{item}</Text>
                  <Icon name="close-circle" type="ionicon" size={16} color="#F44336" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderQuestion = () => {
    if (!test || !test.questions || test.questions.length === 0) {
      return <Text style={styles.errorText}>No questions available</Text>;
    }

    const question = test.questions[currentQuestionIndex];
    
    switch (question.type) {
      case 'multiple-choice':
        return renderMultipleChoiceQuestion(question);
      case 'matching':
        return renderMatchingQuestion(question);
      case 'ordering':
        return renderOrderingQuestion(question);
      case 'fill-in-blanks':
        return renderFillInBlanksQuestion(question);
      case 'input':
        return renderInputQuestion(question);
      case 'categories':
        return renderCategoriesQuestion(question);
      default:
        return <Text style={styles.errorText}>Unknown question type</Text>;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F8EF7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.timerContainer}>
          <Icon name="time-outline" type="ionicon" size={20} color="#FF5722" />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {test.questions.length}
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {renderQuestion()}
      </ScrollView>

      <View style={styles.navigationContainer}>
        <Button
          title="Previous"
          disabled={currentQuestionIndex === 0}
          onPress={handlePreviousQuestion}
          buttonStyle={[styles.navButton, styles.prevButton]}
          titleStyle={styles.navButtonText}
          icon={{ name: 'chevron-back', type: 'ionicon', color: 'white' }}
        />
        
        {currentQuestionIndex === test.questions.length - 1 ? (
          <Button
            title="Finish"
            onPress={() => setShowConfirmation(true)}
            buttonStyle={[styles.navButton, styles.finishButton]}
            titleStyle={styles.navButtonText}
            icon={{ name: 'checkmark-circle', type: 'ionicon', color: 'white' }}
            iconRight
          />
        ) : (
          <Button
            title="Next"
            onPress={handleNextQuestion}
            buttonStyle={[styles.navButton, styles.nextButton]}
            titleStyle={styles.navButtonText}
            icon={{ name: 'chevron-forward', type: 'ionicon', color: 'white' }}
            iconRight
          />
        )}
      </View>

      <Overlay
        isVisible={showConfirmation}
        onBackdropPress={() => setShowConfirmation(false)}
        overlayStyle={styles.overlay}
      >
        <Text style={styles.overlayTitle}>Submit Test?</Text>
        <Text style={styles.overlayText}>
          Are you sure you want to submit your test? You won't be able to change your answers after submission.
        </Text>
        <View style={styles.overlayButtons}>
          <Button
            title="Cancel"
            onPress={() => setShowConfirmation(false)}
            buttonStyle={styles.cancelButton}
            titleStyle={styles.cancelButtonText}
          />
          <Button
            title="Submit"
            loading={submitting}
            onPress={handleSubmitTest}
            buttonStyle={styles.submitButton}
          />
        </View>
      </Overlay>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  timerText: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
  },
  questionContainer: {
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  selectedOption: {
    borderColor: '#4F8EF7',
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  matchingContainer: {
    marginTop: 10,
  },
  matchingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  matchingOption: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  matchingInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  matchingInputFilled: {
    borderColor: '#4F8EF7',
    backgroundColor: '#E3F2FD',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  orderingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  orderingNumber: {
    width: 30,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F8EF7',
  },
  orderingContent: {
    flex: 1,
  },
  orderingText: {
    fontSize: 16,
    color: '#333',
  },
  orderingControls: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 60,
  },
  fillBlanksContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
  },
  fillBlanksInput: {
    height: 50,
    fontSize: 16,
  },
  fillBlanksHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
  },
  inputAnswer: {
    height: 50,
    fontSize: 16,
  },
  inputHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    width: width / 2 - 25,
    height: 50,
    borderRadius: 25,
  },
  prevButton: {
    backgroundColor: '#9E9E9E',
  },
  nextButton: {
    backgroundColor: '#4F8EF7',
  },
  finishButton: {
    backgroundColor: '#4CAF50',
  },
  navButtonText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    margin: 20,
  },
  divider: {
    backgroundColor: '#e0e0e0',
    height: 1,
  },
  overlay: {
    width: width - 60,
    padding: 20,
    borderRadius: 10,
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  overlayText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  overlayButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    width: (width - 100) / 2,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
  },
  submitButton: {
    width: (width - 100) / 2,
    backgroundColor: '#4CAF50',
  },
  matchingLeftContainer: {
    flex: 1,
  },
  matchingRightContainer: {
    flex: 1,
  },
  multipleBlanksContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
  },
  blankPartText: {
    fontSize: 16,
    color: '#333',
  },
  multipleBlankInput: {
    height: 50,
    fontSize: 16,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  uncategorizedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryItem: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default TestScreen; 