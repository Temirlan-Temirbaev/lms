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
  Image,
} from 'react-native';
import { Button, Icon, Divider, Overlay } from '@rneui/themed';
import * as api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import CustomOverlay from '../../components/CustomOverlay';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
// import DraggableFlatList from 'react-native-draggable-flatlist';

const { width } = Dimensions.get('window');

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
    if (url.endsWith('.mp3') || url.endsWith('.wav')) {
      return <AudioSlider audio={url} />;
    }
    return (
      <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>{children}</Text>
    );
  },
};

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
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const { t } = useTranslation();

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
      setErrorMessage('Failed to load test');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTest = async () => {
    // Check if all questions are answered
    const unansweredQuestions = answers.filter(answer => answer === null).length;
    if (unansweredQuestions > 0) {
      setShowIncompleteWarning(true);
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
      CustomOverlay({
        title: t('test.error'),
        message: 'Failed to submit test',
        platform: Platform.OS
      });
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
      <Text style={styles.instructionText}>
        {t('test.instructions.multipleChoice')}
      </Text>
      {question.content ? (
        <View style={styles.contentContainer}>
          <Markdown style={markdownStyles} rules={renderRules}>
            {question.content}
          </Markdown>
        </View>
      ) : null}
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
            <Icon name="checkmark-circle" type="ionicon" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMatchingQuestion = (question) => {
    const currentAnswers = answers[currentQuestionIndex] || Array(question.options.length).fill('');
    
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {question.question}
        </Text>
        {question.content ? (
          <View style={styles.contentContainer}>
            <Markdown style={markdownStyles} rules={renderRules}>
              {question.content}
            </Markdown>
          </View>
        ) : null}
        {/* <Text style={styles.instructionText}>Match each item on the left with its corresponding item on the right</Text> */}
        
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
        <Text style={styles.questionText}>
          {question.question}
        </Text>
        {question.content ? (
          <View style={styles.contentContainer}>
            <Markdown style={markdownStyles} rules={renderRules}>
              {question.content}
            </Markdown>
          </View>
        ) : null}
        {/* <Text style={styles.instructionText}>Drag items to reorder them</Text> */}
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
                    color={index === 0 ? '#ccc' : colors.primary}
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
                    color={index === currentAnswer.length - 1 ? '#ccc' : colors.primary}
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
    const hasMultipleBlanks = (question.question.match(/_____/g) || []).length > 1;
    
    if (hasMultipleBlanks) {
      return renderMultipleFillInBlanksQuestion(question);
    } else {
      const currentAnswer = answers[currentQuestionIndex] || '';
      
      return (
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {question.question}
          </Text>
          {question.content ? (
            <View style={styles.contentContainer}>
              <Markdown style={markdownStyles} rules={renderRules}>
                {question.content}
              </Markdown>
            </View>
          ) : null}
          <Text style={styles.instructionText}>Fill in the blank with the appropriate word or phrase</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.inputAnswer, { height: 40 }]}
              placeholder="Type your answer here"
              value={currentAnswer}
              onChangeText={(text) => handleAnswerSelect(text)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <Text style={styles.inputHint}>
            Tip: Your answer should be a single word or short phrase
          </Text>
        </View>
      );
    }
  };

  const renderMultipleFillInBlanksQuestion = (question) => {
    const currentAnswers = answers[currentQuestionIndex] || {};
    const parts = question.question.split('_____');
    const blankIds = Array.from({ length: parts.length - 1 }, (_, i) => `blank${i + 1}`);
    
    const handleBlankChange = (blankId, text) => {
      const newAnswers = { ...currentAnswers };
      newAnswers[blankId] = text;
      handleAnswerSelect(newAnswers);
    };
    
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          Fill in the blanks with the appropriate words or phrases
        </Text>
        {question.content ? (
          <View style={styles.contentContainer}>
            <Markdown style={markdownStyles} rules={renderRules}>
              {question.content}
            </Markdown>
          </View>
        ) : null}
        <Text style={styles.instructionText}>Complete the sentence with the correct words</Text>
        
        <View style={styles.multipleBlanksContainer}>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <Text style={styles.blankPartText}>{part}</Text>
              {index < parts.length - 1 && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.inputAnswer, { height: 40 }]}
                    placeholder="Type here"
                    value={currentAnswers[`blank${index + 1}`] || ''}
                    onChangeText={(text) => handleBlankChange(`blank${index + 1}`, text)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
        
        <Text style={styles.inputHint}>
          Tip: Pay attention to verb conjugations and agreements
        </Text>
      </View>
    );
  };

  const renderInputQuestion = (question) => {
    const currentAnswer = answers[currentQuestionIndex] || '';
    
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {question.question}
        </Text>
        {question.content ? (
          <View style={styles.contentContainer}>
            <Markdown style={markdownStyles} rules={renderRules}>
              {question.content}
            </Markdown>
          </View>
        ) : null}
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

  const renderCategoryItem = (item) => {
    // Check if the item is an object containing image URL and text
    if (typeof item === 'object' && item.image) {
      return (
        <View style={styles.categoryItemContent}>
          <Image 
            source={{ uri: item.image }}
            style={styles.categoryItemImage}
          />
          {item.text && <Text style={styles.categoryItemText}>{item.text}</Text>}
        </View>
      );
    }
    // If it's just a string, render as before
    return <Text style={styles.categoryItemText}>{item}</Text>;
  };

  const renderCategoriesQuestion = (question) => {
    const currentAnswers = answers[currentQuestionIndex] || {};
    const categories = Object.keys(question.correctAnswer || {});
    
    // Initialize categories in the current answer if they don't exist
    categories.forEach(category => {
      if (!currentAnswers[category]) {
        currentAnswers[category] = [];
      }
    });
    
    // Render category title - if it starts with @ it's an image
    const renderCategoryTitle = (category) => {
      if (category.startsWith('https')) {
        return (
          <Image
            source={{ uri: category }}
            style={{ width: 100, height: 100, resizeMode: 'contain' }}
          />
        );
      }
      return <Text style={styles.categoryTitle}>{category}</Text>;
    };

    // Get all options that haven't been categorized yet
    const uncategorizedOptions = (question.options || []).filter(option => {
      // Check if the option exists in any category
      return !Object.values(currentAnswers).some(categoryItems => {
        if (!categoryItems) return false;
        return categoryItems.some(item => {
          if (typeof item === 'object' && typeof option === 'object') {
            return item.image === option.image;
          }
          return item === option;
        });
      });
    });
    
    const handleAddToCategory = (option, category) => {
      const newAnswers = { ...currentAnswers };
      
      // Remove the option from any other category it might be in
      Object.keys(newAnswers).forEach(cat => {
        if (!newAnswers[cat]) newAnswers[cat] = [];
        newAnswers[cat] = newAnswers[cat].filter(item => {
          if (typeof item === 'object' && typeof option === 'object') {
            return item.image !== option.image;
          }
          return item !== option;
        });
      });
      
      // Add the option to the selected category
      if (!newAnswers[category]) newAnswers[category] = [];
      newAnswers[category] = [...newAnswers[category], option];
      
      handleAnswerSelect(newAnswers);
    };
    
    const handleRemoveFromCategory = (option, category) => {
      const newAnswers = { ...currentAnswers };
      if (!newAnswers[category]) newAnswers[category] = [];
      newAnswers[category] = newAnswers[category].filter(item => {
        if (typeof item === 'object' && typeof option === 'object') {
          return item.image !== option.image;
        }
        return item !== option;
      });
      handleAnswerSelect(newAnswers);
    };

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {question.question}
        </Text>
        {question.content ? (
          <View style={styles.contentContainer}>
            <Markdown style={markdownStyles} rules={renderRules}>
              {question.content}
            </Markdown>
          </View>
        ) : null}
        {/* <Text style={styles.instructionText}>Drag or tap items to place them in the correct category</Text> */}
        
        {/* Uncategorized options */}
        <View style={styles.categoriesSection}>
          <Text style={styles.categoryTitle}>{t('test.availableItems')}:</Text>
          <View style={styles.uncategorizedContainer}>
            {uncategorizedOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryItem}
                onPress={() => {
                  setSelectedOption(option);
                  setShowCategorySelection(true);
                }}
              >
                {renderCategoryItem(option)}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Categories */}
        {categories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categoriesSection}>
            {renderCategoryTitle(category)}
            <View style={styles.categoryContainer}>
              {(currentAnswers[category] || []).map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.categoryItem}
                  onPress={() => handleRemoveFromCategory(item, category)}
                >
                  {renderCategoryItem(item)}
                  <Icon 
                    name="close-circle" 
                    type="ionicon" 
                    size={16} 
                    color="#F44336"
                    style={styles.categoryItemRemoveIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Category Selection Overlay */}
        <CustomOverlay
          isVisible={showCategorySelection}
          onClose={() => setShowCategorySelection(false)}
          title={t('test.selectCategory')}
          message="Select a category for this item"
          scrollable={true}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categorySelectionButton}
              onPress={() => {
                handleAddToCategory(selectedOption, category);
                setShowCategorySelection(false);
              }}
            >
              {renderCategoryTitle(category)}
            </TouchableOpacity>
          ))}
        </CustomOverlay>
      </View>
    );
  };

  const renderQuestion = () => {
    if (!test || !test.questions || test.questions.length === 0) {
      return <Text style={styles.errorText}>{t('test.noQuestions')}</Text>;
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
        return <Text style={styles.errorText}>{t('test.unknownType')}</Text>;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('test.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.timerContainer}>
          <Icon name="time-outline" type="ionicon" size={20} color={colors.timer.text} />
          <Text style={styles.timerText}>
            {t('test.timeLeft')}: {formatTime(timeLeft)}
          </Text>
        </View>
        <Text style={styles.progressText}>
          {t('test.questionProgress', {
            current: currentQuestionIndex + 1,
            total: test.questions.length
          })}
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {renderQuestion()}
      </ScrollView>

      <View style={styles.navigationContainer}>
        <Button
          title={t('test.previous')}
          disabled={currentQuestionIndex === 0}
          onPress={handlePreviousQuestion}
          buttonStyle={[styles.navButton, styles.prevButton]}
          titleStyle={styles.navButtonText}
          icon={{ name: 'chevron-back', type: 'ionicon', color: 'white' }}
        />
        
        {currentQuestionIndex === test.questions.length - 1 ? (
          <Button
            title={t('test.finish')}
            onPress={() => setShowConfirmation(true)}
            buttonStyle={[styles.navButton, styles.finishButton]}
            titleStyle={styles.navButtonText}
            icon={{ name: 'checkmark-circle', type: 'ionicon', color: 'white' }}
            iconRight
          />
        ) : (
          <Button
            title={t('test.next')}
            onPress={handleNextQuestion}
            buttonStyle={[styles.navButton, styles.nextButton]}
            titleStyle={styles.navButtonText}
            icon={{ name: 'chevron-forward', type: 'ionicon', color: 'white' }}
            iconRight
          />
        )}
      </View>

      <CustomOverlay
        isVisible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title={t('test.submitTitle')}
        message={t('test.submitMessage')}
        buttons={[
          {
            text: t('test.cancel'),
            onPress: () => setShowConfirmation(false),
            type: 'cancel'
          },
          {
            text: t('test.submit'),
            onPress: handleSubmitTest,
            loading: submitting,
            style: { backgroundColor: colors.success }
          }
        ]}
      />

      <CustomOverlay
        isVisible={showError}
        onClose={() => setShowError(false)}
        title={t('test.error')}
        message={errorMessage}
        buttons={[
          {
            text: t('test.ok'),
            onPress: () => setShowError(false),
            style: { backgroundColor: colors.primary }
          }
        ]}
      />

      <CustomOverlay
        isVisible={showIncompleteWarning}
        onClose={() => setShowIncompleteWarning(false)}
        title={t('test.incompleteTitle')}
        message={t('test.incompleteMessage', {
          count: answers.filter(answer => answer === null).length
        })}
        buttons={[
          {
            text: t('test.cancel'),
            onPress: () => setShowIncompleteWarning(false),
            type: 'cancel'
          },
          {
            text: t('test.submitAnyway'),
            onPress: () => {
              setShowIncompleteWarning(false);
              submitTest();
            },
            style: { backgroundColor: colors.success }
          }
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    borderBottomColor: colors.border,
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
    fontWeight: 'bold',
    color: colors.timer.text,
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
  contentContainer: {
    marginTop: 15,
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
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
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
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
  matchingLeftContainer: {
    flex: 1,
  },
  matchingRightContainer: {
    flex: 1,
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
    borderColor: colors.border,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  matchingInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
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
    color: colors.primary,
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
    borderTopColor: colors.border,
  },
  navButton: {
    width: width / 2 - 25,
    height: 50,
    borderRadius: 25,
  },
  prevButton: {
    backgroundColor: colors.gray,
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  finishButton: {
    backgroundColor: colors.success,
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
    position: 'relative',
  },
  categoryItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItemImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryItemRemoveIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  categorySelectionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default TestScreen; 