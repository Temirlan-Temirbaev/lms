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
  Platform,
} from 'react-native';
import { Button, Icon, Divider, Overlay } from '@rneui/themed';
import * as api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import CustomOverlay from '../../components/CustomOverlay';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { AudioSlider } from './AudioSlider';
// import DraggableFlatList from 'react-native-draggable-flatlist';

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
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [finalTotalPoints, setFinalTotalPoints] = useState(null);
  const { t } = useTranslation();
  const [contentSegments, setContentSegments] = useState([]);
  const [questionAudioUrls, setQuestionAudioUrls] = useState([]);

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#2196F3';
    if (score >= 50) return '#FF9800';
    return '#F44336';
  };

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
      const testData = response.data;
      
      // Randomize options for ordering and categories questions
      testData.questions = testData.questions.map(question => {
        if (question.type === 'ordering') {
          return {
            ...question,
            options: shuffleArray([...question.options])
          };
        }
        if (question.type === 'categories') {
          return {
            ...question,
            options: shuffleArray([...question.options])
          };
        }
        return question;
      });
      
      setTest(testData);
      const initialAnswers = testData.questions.map(() => null);
      setAnswers(initialAnswers);
      setTimeLeft(testData.timeLimit * 60);
      // setTimerActive(true);
    } catch (error) {
      setErrorMessage('Failed to load test');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Add this helper function at the top level of your component
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleSubmitTest = async () => {
    const unansweredQuestions = answers.filter((answer, index) => {
      if (!answer) return true;
      if (Array.isArray(answer) && answer.length === 0) return true;
      if (typeof answer === 'object' && Object.keys(answer).length === 0) return true;
      return false;
    }).length;
  
    if (unansweredQuestions > 0) {
      setShowConfirmation(false); // Close confirmation first
      setTimeout(() => {
        setShowIncompleteWarning(true);
      }, 100);
    } else {
      setShowConfirmation(false);
      setTimeout(() => {
        submitTest();
      }, 100);
    }
  };

const closeAllOverlays = () => {
  setShowCategorySelection(false);
  setShowConfirmation(false);
  setShowIncompleteWarning(false);
  setShowError(false);
  setShowResults(false);
};

// Modify the overlay opening functions
const handleShowConfirmation = () => {
  closeAllOverlays();
  setTimeout(() => {
    setShowConfirmation(true);
  }, 100);
};

  const submitTest = async () => {
    setSubmitting(true);
    try {
      let totalPoints = 0;
      const questionCount = test.questions.length;
      setQuestionCount(questionCount);

      answers.forEach((answer, index) => {
        const question = test.questions[index];
        
        if (!question) return;
        
        if (!answer || 
            (Array.isArray(answer) && answer.length === 0) ||
            (typeof answer === 'object' && Object.keys(answer).length === 0)) {
          return;
        }
        
        let isCorrect = false;
        
        switch (question.type) {
          case 'multiple-choice':
            isCorrect = question.correctAnswer.toLowerCase() === answer.toLowerCase();
            break;
          case 'fill-in-blanks':
            console.log('Question:', question);
            console.log('User Answer:', answer);
            console.log('Correct Answer:', question.correctAnswer);
            
            if (typeof answer === 'object' && typeof question.correctAnswer === 'object') {
              // Handle multiple blanks case
              isCorrect = Object.keys(answer).every(blankId => {
                const correctAnswerArray = question.correctAnswer[blankId] || [];
                const userAnswer = answer[blankId];
                
                if (!userAnswer) return false;
                
                // Check if user's answer matches any of the correct answers (case insensitive)
                return correctAnswerArray.some(correct => 
                  String(userAnswer).toLowerCase().trim() === String(correct).toLowerCase().trim()
                );
              });
            } else {
              isCorrect = false;
            }
            break;
          case 'matching':
            // Ensure both arrays exist and map their values to lowercase strings
            const correctAnswers = Array.isArray(question.correctAnswer) 
              ? question.correctAnswer.map(a => String(a).toLowerCase()).sort()
              : [];
            const userAnswers = Array.isArray(answer)
              ? answer.map(a => String(a).toLowerCase()).sort()
              : [];
            
            isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);
            break;
          case 'ordering':
            console.log('Correct Answer:', question.correctAnswer);
            console.log('User Answer:', answer);
            
            const normalizedCorrect = question.correctAnswer.map(a => 
              String(a).toLowerCase().trim()
                .replace('c', 'с') // Replace Latin 'c' with Cyrillic 'с'
                .normalize('NFKD') // Normalize Unicode characters
            );
            const normalizedUser = answer.map(a => 
              String(a).toLowerCase().trim()
                .replace('c', 'с') // Replace Latin 'c' with Cyrillic 'с'
                .normalize('NFKD') // Normalize Unicode characters
            );
            
            console.log('Normalized Correct:', normalizedCorrect);
            console.log('Normalized User:', normalizedUser);
            
            isCorrect = JSON.stringify(normalizedCorrect) === JSON.stringify(normalizedUser);
            break;
          case 'categories':
            isCorrect = Object.keys(question.correctAnswer).every(category => {
              // Get correct answers as simple array
              const correctAnswers = question.correctAnswer[category].map(item => 
                String(item).toLowerCase().trim()
              );

              // Get user answers - handle the specific structure where answer is an array of objects
              const userAnswers = (answer[category] || []).map(item => {
                // Handle the case where the answer is stored as {0: 'value', originalIndex: 0}
                if (item && typeof item === 'object') {
                  // If the answer is in the numeric key format
                  const value = item[0] || Object.values(item)[0];
                  return String(value).toLowerCase().trim();
                }
                return '';
              }).filter(Boolean);

              console.log('Processed correct answers:', correctAnswers);
              console.log('Processed user answers:', userAnswers);

              return correctAnswers.length === userAnswers.length &&
                    correctAnswers.every(correct => userAnswers.includes(correct));
            });
            break;
          case 'input':
            if (typeof answer === 'string') {
              isCorrect = question.correctAnswer.toLowerCase().trim() === answer.toLowerCase().trim();
            } else if (Array.isArray(question.correctAnswer)) {
              isCorrect = question.correctAnswer.some(correct => 
                answer.toLowerCase().trim() === correct.toLowerCase().trim());
            }
            break;
        }
        
        if (isCorrect) {
          totalPoints += question.points;
        }
      });
      
      console.log('Submitting total points:', totalPoints);
      setFinalTotalPoints(totalPoints);
      const response = await api.submitTest(testId, totalPoints, test.isFinal);
      
      // Show results after a small delay
      setTimeout(() => {
        setTestResults(response.data);
        setShowResults(true);
      }, 300);
      
    } catch (error) {
      console.error('Error submitting test:', error);
      setTimeout(() => {
        setShowError(true);
        setErrorMessage(t('test.submitError'));
      }, 300);
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
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question.question}</Text>
      {question.content && renderQuestionContent(question.content)}
      <Text style={styles.instructionText}>
        {t('test.instructions.multipleChoice')}
      </Text>
      {question.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionContainer,
            answers[currentQuestionIndex] === option && styles.selectedOption,
          ]}
          onPress={() => handleAnswerSelect(option)}
        >
          <Text style={[
            styles.optionText,
            answers[currentQuestionIndex] === option && styles.selectedOptionText
          ]}>{option}</Text>
          {answers[currentQuestionIndex] === option && (
            <Icon name="checkmark-circle" type="ionicon" size={20} color={colors.white} />
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
        {question.content && renderQuestionContent(question.content)}
        
        {question.options.map((option, index) => (
          <View key={index} style={styles.matchingItem}>
            <View style={styles.matchingLeftContainer}>
              <Text style={styles.matchingOption}>{option}</Text>
            </View>
            <View style={styles.matchingRightContainer}>
              <TextInput
                style={[
                  styles.matchingInput,
                  currentAnswers[index] ? styles.matchingInputFilled : null
                ]}
                placeholder={t('test.typeHere')}
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
        {question.content && renderQuestionContent(question.content)}
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
            {question.title || 'Бос орындарды толықтырыңыз'}
          </Text>
          {question.content && renderQuestionContent(question.content)}
          {/* <Text style={styles.instructionText}>Fill in the blank with the appropriate word or phrase</Text> */}
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.inputAnswer, { height: 40 }]}
              placeholder={t('test.typeHere')}
              value={currentAnswer}
              onChangeText={(text) => handleAnswerSelect(text)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          {/* <Text style={styles.inputHint}>
            Tip: Your answer should be a single word or short phrase
          </Text> */}
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
          {question.title || 'Бос орындарды толықтырыңыз'}
        </Text>
        {question.content && renderQuestionContent(question.content)}
        {/* <Text style={styles.instructionText}>Complete the sentence with the correct words</Text> */}
        
        <View style={styles.multipleBlanksContainer}>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <Text style={styles.blankPartText}>{part}</Text>
              {index < parts.length - 1 && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.inputAnswer, { height: 40 }]}
                    placeholder={t('test.typeHere')}
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
        
        {/* <Text style={styles.inputHint}>
          Tip: Pay attention to verb conjugations and agreements
        </Text> */}
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
        {question.content && renderQuestionContent(question.content)}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputAnswer}
            placeholder={t('test.typeHere')}
            value={currentAnswer}
            onChangeText={(text) => handleAnswerSelect(text)}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

      </View>
    );
  };

  const renderCategoryItem = (item) => {
    // Handle when item is an object with originalIndex
    if (item && typeof item === 'object' && 'originalIndex' in item) {
      if (typeof item.option === 'object') {
        item = item.option;
      } else {
        item = item.option || item;
      }
    }

    // Get the text content
    let textContent;
  if (Array.isArray(item)) {
    textContent = item.join(' ');
  } else if (typeof item === 'object') {
    textContent = item.text || String(item);
  } else {
    textContent = String(item);
  }
    const isLongText = textContent && textContent.length > 20;
  
    if (typeof item === 'object' && item.image) {
      return (
        <View style={styles.categoryItemContent}>
          <Image 
            source={{ uri: item.image }}
            style={styles.categoryItemImage}
          />
          {item.text && <Text style={styles.categoryItemText} numberOfLines={2}>{item.text}</Text>}
        </View>
      );
    }
    
    return isLongText ? (
      <Text style={[styles.categoryItemTextLong, { flexWrap: 'wrap' }]} numberOfLines={4}>
        {textContent}
      </Text>
    ) : (
      <Text style={styles.categoryItemText} numberOfLines={2}>
        {textContent}
      </Text>
    );
  };

  const renderCategoriesQuestion = (question) => {
    const currentAnswers = answers[currentQuestionIndex] || {};  // Use answers from state
    const categories = Object.keys(question.correctAnswer || {});
    
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
    const uncategorizedOptions = question.options.map((option, index) => ({
      option,
      index
    })).filter(({ option, index }) => {
      return !Object.values(currentAnswers).some(categoryItems => {
        if (!categoryItems) return false;
        return categoryItems.some(item => 
          item.originalIndex === index
        );
      });
    });
    
    const handleAddToCategory = (optionWithIndex, category) => {
      const newAnswers = { ...currentAnswers };
      
      // Add the option to the selected category with its original index
      const optionContent = typeof optionWithIndex.option === 'object' 
      ? optionWithIndex.option.text 
      : optionWithIndex.option;
      
    newAnswers[category] = [...newAnswers[category], {
      option: optionContent,  // Store the text content directly
      originalIndex: optionWithIndex.index
    }];
      
      handleAnswerSelect(newAnswers);
    };
    
    const handleRemoveFromCategory = (item, category) => {
      const newAnswers = { ...currentAnswers };
      if (!newAnswers[category]) newAnswers[category] = [];
      newAnswers[category] = newAnswers[category].filter(categoryItem => 
        categoryItem.originalIndex !== item.originalIndex
      );
      handleAnswerSelect(newAnswers);
    };

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {question.question}
        </Text>
        {question.content && renderQuestionContent(question.content)}
        {/* <Text style={styles.instructionText}>Drag or tap items to place them in the correct category</Text> */}
        
{/* Uncategorized options */}
<View style={styles.categoriesSection}>
  {/* <Text style={styles.categoryTitle}>{t('test.availableItems')}</Text> */}
  <View style={styles.uncategorizedContainer}>
    {uncategorizedOptions.map(({option, index}) => {
      const textContent = typeof option === 'object' ? option.text : option;
      const isLongText = textContent && textContent.length > 50;
      
      return (
        <TouchableOpacity
          key={`${index}-${textContent}`}
          style={[
            styles.categoryItem,
            isLongText && { 
              width: '100%', 
              flexDirection: 'column', 
              padding: 15,
              marginBottom: 10 
            }
          ]}
          onPress={() => {
            setSelectedOption({option, index});
            setShowCategorySelection(true);
          }}
        >
          <View style={{ flex: 1, width: '100%' }}>
            <Text style={[
              isLongText ? styles.categoryItemTextLong : styles.categoryItemText,
              { flexWrap: 'wrap' }
            ]}>
              {textContent}
            </Text>
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
</View>
        
        {/* Categories */}
        {/* Categories */}
{categories.map((category, categoryIndex) => (
  <View key={categoryIndex} style={styles.categoriesSection}>
    {renderCategoryTitle(category)}
    <View style={styles.categoryContainer}>
      {(currentAnswers[category] || []).map((item, itemIndex) => {
        const textContent = typeof item.option === 'object' ? item.option.text : item.option;
        const isLongText = textContent && textContent.length > 50;
        
        return (
          <TouchableOpacity
            key={`${item.originalIndex}-${itemIndex}`}
            style={[
              styles.categoryItem,
              isLongText && { width: '100%', flexDirection: 'column', padding: 15 }
            ]}
            onPress={() => handleRemoveFromCategory(item, category)}
          >
            <View style={{ flex: 1, width: '100%' }}>
              <Text style={[
                isLongText ? styles.categoryItemTextLong : styles.categoryItemText,
                { flexWrap: 'wrap' }
              ]}>
                {textContent}
              </Text>
            </View>
            <Icon 
              name="close-circle" 
              type="ionicon" 
              size={16} 
              color="#F44336"
              style={[
                styles.categoryItemRemoveIcon,
                isLongText && { position: 'absolute', top: 5, right: 5 }
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
))}

        {/* Category Selection Overlay */}
        <CustomOverlay
  isVisible={showCategorySelection}
  onClose={() => setShowCategorySelection(false)}
  title={t('test.selectCategory')}
  message=""
  scrollable={true}
>
  <ScrollView style={styles.categorySelectionScrollView}>
    {categories.map((category, index) => (
      <TouchableOpacity
        key={index}
        style={styles.categorySelectionButton}
        onPress={() => {
          if (selectedOption) {
            handleAddToCategory(selectedOption, category);
            setShowCategorySelection(false);
          }
        }}
      >
        {category.startsWith('https') ? (
          <Image
            source={{ uri: category }}
            style={styles.categorySelectionImage}
          />
        ) : (
          <Text style={styles.categorySelectionText}>{category}</Text>
        )}
      </TouchableOpacity>
    ))}
  </ScrollView>
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
        {/* <View style={styles.timerContainer}>
          <Icon name="time-outline" type="ionicon" size={20} color={colors.timer.text} />
          <Text style={styles.timerText}>
            {t('test.timeLeft')}: {formatTime(timeLeft)}
          </Text>
        </View> */}
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
          buttonStyle={[
            styles.navButton,
            styles.prevButton,
            currentQuestionIndex === 0 && styles.disabledButton
          ]}
          titleStyle={[
            styles.navButtonText,
            currentQuestionIndex === 0 && styles.disabledButtonText
          ]}
          icon={{
            name: 'chevron-back',
            type: 'ionicon',
            size: 20,
            color: currentQuestionIndex === 0 ? colors.darkGray : colors.white
          }}
        />
        
        {currentQuestionIndex === test.questions.length - 1 ? (
          <Button
            title={t('test.finish')}
            onPress={() => setShowConfirmation(true)}
            buttonStyle={[styles.navButton, styles.finishButton]}
            titleStyle={styles.navButtonText}
            icon={{
              name: 'checkmark-circle',
              type: 'ionicon',
              size: 20,
              color: colors.white
            }}
            iconRight
          />
        ) : (
          <Button
            title={t('test.next')}
            onPress={handleNextQuestion}
            buttonStyle={[styles.navButton, styles.nextButton]}
            titleStyle={styles.navButtonText}
            icon={{
              name: 'chevron-forward',
              type: 'ionicon',
              size: 20,
              color: colors.white
            }}
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

      <CustomOverlay
        isVisible={showResults}
        onClose={() => {
          setShowResults(false);
          refreshUser();
          navigation.replace('HomeScreen');
        }}
        title={t('test.results')}
        scrollable={true}
      >
        <View style={styles.resultsContainer}>
          <View style={styles.scoreContainer}>
            <View style={[
              styles.scoreCircle,
              { backgroundColor: testResults?.passed ? '#E8F5E9' : '#FFEBEE' }
            ]}>
              <Icon
                name={testResults?.passed ? 'checkmark-circle' : 'close-circle'}
                type="ionicon"
                size={Math.min(40, width * 0.1)}
                color={testResults?.passed ? '#4CAF50' : '#F44336'}
              />
              <Text style={[
                styles.scoreText,
                { color: getScoreColor(testResults?.score) }
              ]}>
                {parseInt(testResults?.score).toFixed(2)}%
              </Text>
            </View>
            
            <Text style={[
              styles.scoreLabel,
              { color: testResults?.passed ? '#4CAF50' : '#F44336' }
            ]}>
              {testResults?.passed ? t('test.passed') : t('test.failed')}
            </Text>
            
            <Text style={styles.scoreDetails}>
              {t('test.pointsEarned', {
                earned: finalTotalPoints,
                total: testResults?.totalPossiblePoints
              })}
            </Text>
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
    fontSize: 24,
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
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  matchingContainer: {
    marginTop: 10,
  },
  matchingItem: {
    marginBottom: 20,
  },
  matchingLeftContainer: {
    marginBottom: 8,
  },
  matchingRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchingOption: {
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
  },
  matchingInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  matchingInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  multipleBlanksContainer: {
    marginTop: 15,
  },
  blankPartText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
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
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.white,
  },
  inputAnswer: {
    height: 45,
    fontSize: 16,
    paddingHorizontal: 5,
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
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  navButton: {
    minWidth: 120,
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  prevButton: {
    backgroundColor: colors.primary,
    paddingLeft: 10,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingRight: 10,
  },
  finishButton: {
    backgroundColor: colors.success,
    paddingRight: 10,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  navButtonText: {
    fontSize: 16,
    color: colors.white,
    marginHorizontal: 5,
  },
  disabledButtonText: {
    color: colors.darkGray,
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
  uncategorizedContainerLong: {
    flexDirection: 'column',
    paddingHorizontal: 10,
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
  categoryItemLong: {
    padding: 15,
    margin: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    position: 'relative',
    width: '100%', // Full width for long text
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
  categoryItemTextLong: {
    fontSize: 13,
    color: '#333',
    textAlign: 'left',
    paddingHorizontal: 8,
    lineHeight: 18,
    flexShrink: 1,
    width: '100%',
    flexWrap: 'wrap',
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
  categorySelectionContainer: {
    padding: 10,
    width: '100%',
  },
  categoryOverlayContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  categorySelectionContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categorySelectionScrollView: {
    width: '100%',
    maxHeight: height * 0.6, // 60% of screen height
  },
  categorySelectionButton: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 50,
    justifyContent: 'center',
  },
  categorySelectionText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  categorySelectionImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  audioWrapper: {
    marginVertical: 10,
    width: '100%',
  },
  resultsContainer: {
    padding: 20,
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center', // Add this
    marginBottom: Math.min(20, height * 0.02),
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%', // Add this
  },
  scoreCircle: {
    width: Math.min(120, width * 0.3),
    height: Math.min(120, width * 0.3),
    borderRadius: Math.min(60, width * 0.15),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Math.min(15, height * 0.02),
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center', // Add this
  },
  scoreLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Math.min(10, height * 0.01),
    textAlign: 'center', // Add this
    width: '100%', // Add this
    marginRight: 0, // Add this to remove any potential margin
  },
  scoreDetails: {
    fontSize: Math.min(16, width * 0.04),
    color: '#666',
    textAlign: 'center', // Add this
    width: '100%', // Add this
  },
  resultsList: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: Math.min(20, width * 0.05),
    fontWeight: 'bold',
    marginBottom: Math.min(15, height * 0.02),
    color: '#333',
  },
  resultItem: {
    padding: Math.min(15, width * 0.04),
    borderRadius: 10,
    marginBottom: Math.min(10, height * 0.01),
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Math.min(10, height * 0.01),
    flexWrap: 'wrap',
  },
  questionNumber: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Math.min(10, width * 0.03),
    paddingVertical: Math.min(5, height * 0.01),
    borderRadius: 15,
    marginLeft: 10,
  },
  resultText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
    fontSize: Math.min(14, width * 0.035),
  },
  questionText: {
    fontSize: 24,
    color: '#333',
    marginBottom: Math.min(10, height * 0.01),
  },
  explanationContainer: {
    backgroundColor: 'white',
    padding: Math.min(15, width * 0.04),
    borderRadius: 10,
    marginTop: Math.min(10, height * 0.01),
  },
  yourAnswerLabel: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: Math.min(5, height * 0.01),
  },
  correctAnswerLabel: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: Math.min(10, height * 0.01),
    marginBottom: Math.min(5, height * 0.01),
  },
  explanationLabel: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
    color: '#4F8EF7',
    marginTop: Math.min(10, height * 0.01),
    marginBottom: Math.min(5, height * 0.01),
  },
  answerText: {
    fontSize: Math.min(16, width * 0.04),
    color: '#333',
    marginBottom: Math.min(5, height * 0.01),
  },
});

export default TestScreen;