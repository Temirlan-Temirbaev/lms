import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  FlatList,
  Animated,
  PanResponder,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Button, Icon, Overlay, Divider } from '@rneui/themed';
import * as api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import CustomOverlay from '../../components/CustomOverlay';
import Markdown from 'react-native-markdown-display';
import { AudioSlider } from './AudioSlider';

const { width, height } = Dimensions.get('window');

const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: colors.primary,
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  paragraph: {
    marginBottom: 16,
  },
};

const renderRules = {
  image: (node) => {
    const imageUrl = node.attributes.src;
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: '100%', height: 200, resizeMode: 'contain', marginVertical: 10 }}
      />
    );
  },
  link: (node, children, parent, styles) => {
    const url = node.attributes.href;
    if (url.endsWith('.mp3') || url.endsWith('.m4a')) {
      return null; // Don't render audio links in markdown
    }
    return (
      <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>{children}</Text>
    );
  },
};

const PlacementTestScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { refreshUser, user } = useAuth();
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);
  
  const timerRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [contentSegments, setContentSegments] = useState([]);
  const [questionAudioUrls, setQuestionAudioUrls] = useState([]);
  
  useEffect(() => {
    fetchPlacementTest();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (test && test.timeLimit) {
      const timeInSeconds = test.timeLimit * 60;
      setTimer(timeInSeconds);
      
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(timerRef.current);
            handleSubmitTest();
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
  }, [test]);
  
  const fetchPlacementTest = async () => {
    try {
      setLoading(true);
      const response = await api.getPlacementTest();
      setTest(response.data);
      
      // Initialize answers object
      const initialAnswers = {};
      response.data.questions.forEach(question => {
        initialAnswers[question._id] = {
          questionId: question._id,
          answer: question.type === 'categories' 
            ? Object.fromEntries(question.options.categories.map(cat => [cat, []]))
            : question.type === 'matching' 
              ? []
              : question.type === 'ordering'
                ? [...question.options]
                : '',
        };
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching placement test:', error);
      setError(t('placementTest.loadError'));
      CustomOverlay({
        title: t('placementTest.error'),
        message: t('placementTest.loadError'),
        platform: Platform.OS
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitTest = async () => {
    setShowConfirmDialog(true);
  };
  
  const submitTest = async () => {
    try {
      setSubmitting(true);
      setShowConfirmDialog(false);
      
      // Calculate total points
      let totalPoints = 0; // Base points
      
      // Process each answer
      Object.values(answers).forEach(answer => {
        const question = test.questions.find(q => q._id === answer.questionId);
        if (!question) return;
        
        // Skip if answer is empty or undefined
        if (!answer.answer || 
            (Array.isArray(answer.answer) && answer.answer.length === 0) ||
            (typeof answer.answer === 'object' && Object.keys(answer.answer).length === 0)) {
          return;
        }
        
        // Check if answer is correct
        let isCorrect = false;
        
        switch (question.type) {
          case 'multiple-choice':
            isCorrect = question.correctAnswer === answer.answer;
            break;
          case 'fill-in-the-blank':
            isCorrect = question.correctAnswer.toLowerCase() === answer.answer.toLowerCase();
            break;
          case 'matching':
            isCorrect = JSON.stringify(question.correctAnswer.sort()) === JSON.stringify(answer.answer.sort());
            break;
          case 'ordering':
            isCorrect = JSON.stringify(question.correctAnswer) === JSON.stringify(answer.answer);
            break;
          case 'categories':
            // Check if each item is in the correct category
            isCorrect = Object.keys(question.correctAnswer).every(category => {
              const correctItems = question.correctAnswer[category];
              const userItems = answer.answer[category] || [];
              return correctItems.length === userItems.length && 
                     correctItems.every(item => userItems.includes(item));
            });
            break;
        }
        
        // Add points to total if correct
        if (isCorrect) {
          totalPoints += question.points;
        }
      });
      
      console.log('Submitting total points:', totalPoints); // Debug log
      
      const response = await api.submitPlacementTest(totalPoints, user.id);
      
      // Refresh user data to update progress
      await refreshUser();
      
      // Show results in overlay
      setTestResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting test:', error);
      CustomOverlay({
        title: t('placementTest.error'),
        message: t('placementTest.submitError'),
        platform: Platform.OS
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleAnswerSelect = (answer) => {
    const currentQuestion = test.questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion._id]: {
        questionId: currentQuestion._id,
        answer,
      },
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const processContent = (content) => {
    if (!content) return { segments: [], audioUrls: [] };
    
    const audioRegex = /\[.*?\]\((.*?\.(?:mp3|m4a))\)/g;
    // Extract all audio URLs first
    const matches = [...content.matchAll(audioRegex)];
    const urls = matches.map(match => match[1].trim()).filter(url => url && url.length > 0);
    
    // Split content into segments at audio links
    const segments = content.split(audioRegex);
    
    return {
      segments: segments.filter(segment => !segment.match(/\.(?:mp3|m4a)$/)), // Filter out the URLs
      audioUrls: urls
    };
  };

  const renderQuestionContent = (content) => {
    if (!content) return null;

    const { segments, audioUrls } = processContent(content);
    
    return (
      <View style={styles.contentContainer}>
        {segments.map((segment, index) => (
          <React.Fragment key={`${currentQuestionIndex}-${index}`}>
            <Markdown style={markdownStyles} rules={renderRules}>
              {segment}
            </Markdown>
            {index < audioUrls.length && (
              <View style={styles.audioWrapper}>
                <AudioSlider 
                  key={`audio-${currentQuestionIndex}-${index}`}
                  audio={audioUrls[index]} 
                />
              </View>
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };
  
  const renderMultipleChoiceQuestion = (question) => (
    <View style={styles.questionContent}>
      <Text style={styles.questionText}>{question.question}</Text>
      {question.content && renderQuestionContent(question.content)}
      {question.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            answers[question._id]?.answer === option && styles.selectedOption,
          ]}
          onPress={() => handleAnswerSelect(option)}
        >
          <Text style={[
            styles.optionText,
            answers[question._id]?.answer === option && styles.selectedOptionText,
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  const renderMatchingQuestion = (question) => {
    const currentAnswer = answers[question._id]?.answer || [];
    const { items, matches } = question.options;
    
    const handleMatchSelect = (item, match) => {
      // Check if this item is already matched
      const existingMatch = currentAnswer.find(m => m.item === item);
      
      let newMatches = [...currentAnswer];
      
      if (existingMatch) {
        // Update existing match
        newMatches = newMatches.map(m => 
          m.item === item ? { item, match } : m
        );
      } else {
        // Add new match
        newMatches.push({ item, match });
      }
      
      handleAnswerSelect(newMatches);
    };
    
    return (
      <View style={styles.questionContent}>
        <Text style={styles.questionText}>{question.question}</Text>
        {question.content && renderQuestionContent(question.content)}
        <View style={styles.matchingContainer}>
          {items.map((item, index) => (
            <View key={index} style={styles.matchingRow}>
              <View style={styles.matchingItem}>
                <Text style={styles.matchingItemText}>{item}</Text>
              </View>
              <Icon name="arrow-forward" type="ionicon" size={20} color="#999" />
              <View style={styles.matchingOptions}>
                {matches.map((match, matchIndex) => {
                  const isSelected = currentAnswer.some(
                    m => m.item === item && m.match === match
                  );
                  return (
                    <TouchableOpacity
                      key={matchIndex}
                      style={[
                        styles.matchingOption,
                        isSelected && styles.selectedMatchingOption,
                      ]}
                      onPress={() => handleMatchSelect(item, match)}
                    >
                      <Text style={[
                        styles.matchingOptionText,
                        isSelected && styles.selectedMatchingOptionText,
                      ]}>
                        {match}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  const renderOrderingQuestion = (question) => {
    const currentAnswer = answers[question._id]?.answer || [...question.options];
    
    const moveItem = (fromIndex, toIndex) => {
      const newOrder = [...currentAnswer];
      const [movedItem] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedItem);
      handleAnswerSelect(newOrder);
    };
    
    return (
      <View style={styles.questionContent}>
        <Text style={styles.questionText}>{question.question}</Text>
        {question.content && renderQuestionContent(question.content)}
        <View style={styles.orderingContainer}>
          {currentAnswer.map((item, index) => (
            <View key={index} style={styles.orderingItemContainer}>
              <View style={styles.orderingItem}>
                <Text style={styles.orderingItemText}>{item}</Text>
              </View>
              <View style={styles.orderingControls}>
                <TouchableOpacity
                  style={[
                    styles.orderingButton,
                    index === 0 && styles.disabledOrderingButton,
                  ]}
                  onPress={() => index > 0 && moveItem(index, index - 1)}
                  disabled={index === 0}
                >
                  <Icon name="chevron-up" type="ionicon" size={20} color={index === 0 ? "#ccc" : "#4F8EF7"} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.orderingButton,
                    index === currentAnswer.length - 1 && styles.disabledOrderingButton,
                  ]}
                  onPress={() => index < currentAnswer.length - 1 && moveItem(index, index + 1)}
                  disabled={index === currentAnswer.length - 1}
                >
                  <Icon name="chevron-down" type="ionicon" size={20} color={index === currentAnswer.length - 1 ? "#ccc" : "#4F8EF7"} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  const renderFillInBlanksQuestion = (question) => {
    return (
      <View style={styles.questionContent}>
        <Text style={styles.questionText}>{question.question}</Text>
        {question.content && renderQuestionContent(question.content)}
        <TextInput
          style={styles.textInput}
          value={answers[question._id]?.answer || ''}
          onChangeText={(text) => handleAnswerSelect(text)}
          placeholder={t('placementTest.typeAnswer')}
          autoCapitalize="none"
        />
      </View>
    );
  };
  
  const renderCategoriesQuestion = (question) => {
    const { categories, items } = question.options;
    const currentAnswer = answers[question._id]?.answer || 
      Object.fromEntries(categories.map(cat => [cat, []]));
    
    // Get uncategorized items
    const categorizedItems = Object.values(currentAnswer).flat();
    const uncategorizedItems = items.filter(item => !categorizedItems.includes(item));
    
    const handleAddToCategory = (item, category) => {
      // Remove item from any existing category
      const newAnswer = { ...currentAnswer };
      
      Object.keys(newAnswer).forEach(cat => {
        newAnswer[cat] = newAnswer[cat].filter(i => i !== item);
      });
      
      // Add to new category
      newAnswer[category] = [...newAnswer[category], item];
      
      handleAnswerSelect(newAnswer);
    };
    
    const handleRemoveFromCategory = (item, category) => {
      const newAnswer = { ...currentAnswer };
      newAnswer[category] = newAnswer[category].filter(i => i !== item);
      handleAnswerSelect(newAnswer);
    };
    
    return (
      <View style={styles.questionContent}>
        <Text style={styles.questionText}>{question.question}</Text>
        {question.content && renderQuestionContent(question.content)}
        {/* Uncategorized items */}
        <View style={styles.uncategorizedContainer}>
          <Text style={styles.categoryTitle}>{t('placementTest.availableItems')}:</Text>
          <View style={styles.itemsContainer}>
            {uncategorizedItems.map((item, index) => (
              <View key={index} style={styles.uncategorizedItem}>
                <Text style={styles.itemText}>{item}</Text>
                <View style={styles.categoryButtons}>
                  {categories.map((category, catIndex) => (
                    <TouchableOpacity
                      key={catIndex}
                      style={styles.addToCategoryButton}
                      onPress={() => handleAddToCategory(item, category)}
                    >
                      <Text style={styles.addToCategoryText}>{t('placementTest.addTo', { category })}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Categories */}
        {categories.map((category, catIndex) => (
          <View key={catIndex} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}:</Text>
            <View style={styles.itemsContainer}>
              {currentAnswer[category].map((item, itemIndex) => (
                <View key={itemIndex} style={styles.categorizedItem}>
                  <Text style={styles.itemText}>{item}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFromCategory(item, category)}
                  >
                    <Icon name="close-circle" type="ionicon" size={20} color="#f44336" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  const renderQuestion = () => {
    if (!test || !test.questions || test.questions.length === 0) {
      return <Text style={styles.errorText}>{t('placementTest.noQuestions')}</Text>;
    }
    
    const currentQuestion = test.questions[currentQuestionIndex];
    
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return renderMultipleChoiceQuestion(currentQuestion);
      case 'matching':
        return renderMatchingQuestion(currentQuestion);
      case 'ordering':
        return renderOrderingQuestion(currentQuestion);
      case 'fill-in-the-blank':
        return renderFillInBlanksQuestion(currentQuestion);
      case 'categories':
        return renderCategoriesQuestion(currentQuestion);
      default:
        return <Text style={styles.errorText}>{t('placementTest.unsupportedType')}</Text>;
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={styles.loadingText}>{t('placementTest.loading')}</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" type="ionicon" size={60} color="#f44336" />
        <Text style={styles.errorText}>{t('placementTest.loadError')}</Text>
        <Button
          title={t('placementTest.tryAgain')}
          onPress={fetchPlacementTest}
          buttonStyle={styles.retryButton}
        />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <View style={styles.testInfo}>
            <Text style={styles.testTitle}>{test.title}</Text>
            <Text style={styles.questionCounter}>
              {t('placementTest.questionCount', {
                current: currentQuestionIndex + 1,
                total: test.questions.length
              })}
            </Text>
          </View>
          <View style={styles.timerContainer}>
            <Icon name="time-outline" type="ionicon" size={20} color="#4F8EF7" />
            <Text style={styles.timerText}>
              {t('placementTest.timeLeft')}: {formatTime(timer)}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }
            ]} 
          />
        </View>
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.questionContainer}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                {test.questions[currentQuestionIndex].level}
              </Text>
            </View>
            {renderQuestion()}
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <Button
            title={t('placementTest.previous')}
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            buttonStyle={[
              styles.navigationButton,
              currentQuestionIndex === 0 && styles.disabledButton
            ]}
            icon={{
              name: 'chevron-back',
              type: 'ionicon',
              size: 20,
              color: currentQuestionIndex === 0 ? '#ccc' : 'white',
            }}
            iconPosition="left"
          />
          
          {currentQuestionIndex === test.questions.length - 1 ? (
            <Button
              title={t('placementTest.submit')}
              onPress={handleSubmitTest}
              buttonStyle={styles.submitButton}
              icon={{
                name: 'checkmark-circle',
                type: 'ionicon',
                size: 20,
                color: 'white',
              }}
              iconPosition="right"
            />
          ) : (
            <Button
              title={t('placementTest.next')}
              onPress={handleNextQuestion}
              buttonStyle={styles.navigationButton}
              icon={{
                name: 'chevron-forward',
                type: 'ionicon',
                size: 20,
                color: 'white',
              }}
              iconPosition="right"
            />
          )}
        </View>
      </KeyboardAvoidingView>
      
      <Overlay
        isVisible={showConfirmDialog}
        onBackdropPress={() => setShowConfirmDialog(false)}
        overlayStyle={styles.overlay}
      >
        <View style={styles.confirmDialog}>
          <Icon name="help-circle" type="ionicon" size={50} color="#FFC107" />
          <Text style={styles.confirmTitle}>{t('placementTest.confirmSubmit')}</Text>
          <Text style={styles.confirmText}>
            {t('placementTest.confirmMessage')}
          </Text>
          <View style={styles.confirmButtons}>
            <Button
              title={t('placementTest.cancel')}
              onPress={() => setShowConfirmDialog(false)}
              buttonStyle={styles.cancelButton}
              titleStyle={styles.cancelButtonText}
              type="outline"
            />
            <Button
              title={t('placementTest.submit')}
              onPress={submitTest}
              loading={submitting}
              buttonStyle={styles.confirmButton}
            />
          </View>
        </View>
      </Overlay>
      
      <CustomOverlay
        isVisible={showResults}
        onClose={() => {
          setShowResults(false);
          navigation.replace('HomeScreen');
        }}
        title={t('placementTest.results')}
        scrollable={true}
      >
        <View style={styles.resultsContainer}>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={[
                styles.scoreText,
                { color: getScoreColor(testResults?.score) }
              ]}>
                {parseInt(testResults?.score).toFixed(2)}%
              </Text>
            </View>
            
            <Text style={styles.scoreLabel}>
              {t('placementTest.assignedLevel', { level: testResults?.assignedLevel })}
            </Text>
            
            <Text style={styles.scoreDetails}>
              {t('placementTest.pointsEarned', {
                earned: parseInt(testResults?.earnedPoints).toFixed(2),
                total: parseInt(testResults?.totalPoints).toFixed(2)
              })}
            </Text>
          </View>

          <View style={styles.resultsList}>
            <Text style={styles.resultsTitle}>{t('placementTest.questionResults')}</Text>
            <Divider style={styles.divider} />
            
            {testResults?.results?.map((result, index) => (
              <React.Fragment key={index}>
                {renderResultItem(result, index)}
                {index < testResults.results.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </CustomOverlay>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  questionCounter: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 5,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.timer.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  timerText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.timer.text,
  },
  progressBarContainer: {
    height: 5,
    backgroundColor: colors.border,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    marginTop: 15,
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  questionContainer: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
  },
  levelText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  questionContent: {
    marginTop: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.black,
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navigationButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  overlay: {
    width: '90%',
    borderRadius: 10,
    padding: 20,
  },
  confirmDialog: {
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  confirmText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    borderColor: '#999',
    borderRadius: 25,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: '#999',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingHorizontal: 20,
  },
  textInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  matchingContainer: {
    marginTop: 10,
  },
  matchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  matchingItem: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 10,
    minWidth: 100,
  },
  matchingItemText: {
    fontSize: 16,
    color: '#333',
  },
  matchingOptions: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 10,
  },
  matchingOption: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    margin: 5,
  },
  selectedMatchingOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  matchingOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedMatchingOptionText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  orderingContainer: {
    marginTop: 10,
  },
  orderingItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderingItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  orderingItemText: {
    fontSize: 16,
    color: '#333',
  },
  orderingControls: {
    marginLeft: 10,
  },
  orderingButton: {
    padding: 5,
  },
  disabledOrderingButton: {
    opacity: 0.5,
  },
  uncategorizedContainer: {
    marginBottom: 20,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  uncategorizedItem: {
    flexDirection: 'column',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categorizedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addToCategoryButton: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 15,
    margin: 5,
  },
  addToCategoryText: {
    fontSize: 12,
    color: '#2196F3',
  },
  removeButton: {
    padding: 5,
  },
  audioWrapper: {
    marginVertical: 10,
    width: '100%',
  },
  resultsContainer: {
    padding: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreCircle: {
    backgroundColor: '#fff',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scoreDetails: {
    fontSize: 14,
    color: '#666',
  },
  resultsList: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  resultItem: {
    marginBottom: 10,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  resultBadge: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 5,
  },
  explanationContainer: {
    marginTop: 10,
  },
  yourAnswerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  correctAnswerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  explanationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

const getScoreColor = (score) => {
  if (score >= 80) return '#4CAF50'; // Green
  if (score >= 60) return '#FFC107'; // Amber
  return '#F44336'; // Red
};

const renderResultItem = (result, index) => (
  <View key={index} style={styles.resultItem}>
    <View style={styles.questionHeader}>
      <Text style={styles.questionNumber}>{t('placementTest.question')} {index + 1}</Text>
      <View style={[
        styles.resultBadge,
        { backgroundColor: result.isCorrect ? '#E8F5E9' : '#FFEBEE' }
      ]}>
        <Icon
          name={result.isCorrect ? 'checkmark-circle' : 'close-circle'}
          type="ionicon"
          size={16}
          color={result.isCorrect ? '#4CAF50' : '#F44336'}
        />
        <Text style={[
          styles.resultText,
          { color: result.isCorrect ? '#4CAF50' : '#F44336' }
        ]}>
          {result.isCorrect ? t('placementTest.correct') : t('placementTest.incorrect')}
        </Text>
      </View>
    </View>

    <Text style={styles.questionText}>{result.question}</Text>

    {!result.isCorrect && (
      <View style={styles.explanationContainer}>
        <Text style={styles.yourAnswerLabel}>{t('placementTest.yourAnswer')}:</Text>
        {renderAnswer(result.userAnswer, result.questionType)}
        
        <Text style={styles.correctAnswerLabel}>{t('placementTest.correctAnswer')}:</Text>
        {renderAnswer(result.correctAnswer, result.questionType)}
        
        <Text style={styles.explanationLabel}>{t('placementTest.explanation')}:</Text>
        <Markdown style={markdownStyles}>{result.explanation}</Markdown>
      </View>
    )}
  </View>
);

export default PlacementTestScreen; 