import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Button, Icon, Divider } from '@rneui/themed';
import Markdown from 'react-native-markdown-display';

const TestResultScreen = ({ route, navigation }) => {
  const { results } = route.params;
  
  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FFC107'; // Amber
    return '#F44336'; // Red
  };

  const renderResultItem = (result, index) => (
    <View key={index} style={styles.resultItem}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>Question {index + 1}</Text>
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
            {result.isCorrect ? 'Correct' : 'Incorrect'}
          </Text>
        </View>
      </View>

      <Text style={styles.questionText}>{result.question}</Text>

      {!result.isCorrect && (
        <View style={styles.explanationContainer}>
          <Text style={styles.yourAnswerLabel}>Your answer:</Text>
          {renderAnswer(result.userAnswer, result.questionType)}
          
          <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
          {renderAnswer(result.correctAnswer, result.questionType)}
          
          <Text style={styles.explanationLabel}>Explanation:</Text>
          <Markdown style={markdownStyles}>{result.explanation}</Markdown>
        </View>
      )}
    </View>
  );

  const renderAnswer = (answer, questionType) => {
    if (questionType === 'matching' && Array.isArray(answer)) {
      return (
        <View style={styles.matchingAnswerContainer}>
          {answer.map((item, index) => (
            <Text key={index} style={styles.matchingAnswerItem}>
              {index + 1}. {item}
            </Text>
          ))}
        </View>
      );
    } else if (questionType === 'ordering' && Array.isArray(answer)) {
      return (
        <View style={styles.orderingAnswerContainer}>
          {answer.map((item, index) => (
            <Text key={index} style={styles.orderingAnswerItem}>
              {index + 1}. {item}
            </Text>
          ))}
        </View>
      );
    } else if (questionType === 'fill-in-blanks' && typeof answer === 'object' && !Array.isArray(answer)) {
      // Multiple blanks
      return (
        <View style={styles.multipleBlanksAnswerContainer}>
          {Object.entries(answer).map(([blankId, value], index) => (
            <Text key={blankId} style={styles.multipleBlanksAnswerItem}>
              Blank {index + 1}: {value}
            </Text>
          ))}
        </View>
      );
    } else if (questionType === 'categories' && typeof answer === 'object' && !Array.isArray(answer)) {
      // Categories
      return (
        <View style={styles.categoriesAnswerContainer}>
          {Object.entries(answer).map(([category, items], index) => (
            <View key={category} style={styles.categoryGroup}>
              <Text style={styles.categoryTitle}>{category}:</Text>
              <View style={styles.categoryItemsContainer}>
                {Array.isArray(items) && items.map((item, itemIndex) => (
                  <Text key={itemIndex} style={styles.categoryItem}>
                    {item}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      );
    } else {
      return (
        <Text style={styles.answerText}>
          {Array.isArray(answer) ? answer.join(', ') : answer}
        </Text>
      );
    }
  };

  const markdownStyles = {
    body: {
      fontSize: 14,
      lineHeight: 20,
      color: '#666',
    },
    paragraph: {
      marginBottom: 10,
    },
    list_item: {
      marginBottom: 5,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={[
              styles.scoreText,
              { color: getScoreColor(results.data.score) }
            ]}>
              {Math.round(results.data.score)}%
            </Text>
          </View>
          
          <Text style={styles.scoreLabel}>
            {results.data.passed ? 'Passed!' : 'Failed'}
          </Text>
          
          <Text style={styles.scoreDetails}>
            You earned {results.data.earnedPoints} out of {results.data.totalPoints} points
          </Text>
        </View>

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Question Results</Text>
          <Divider style={styles.divider} />
          
          {results.data.results.map((result, index) => (
            <React.Fragment key={index}>
              {renderResultItem(result, index)}
              {index < results.data.results.length - 1 && (
                <Divider style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Back to Course"
          onPress={() => navigation.navigate('HomeScreen')}
          buttonStyle={styles.backButton}
          icon={{ name: 'arrow-back', type: 'ionicon', color: 'white' }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f5f5f5',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  scoreDetails: {
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  divider: {
    backgroundColor: '#e0e0e0',
    height: 1,
    marginVertical: 15,
  },
  resultItem: {
    marginBottom: 10,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  resultText: {
    marginLeft: 5,
    fontWeight: 'bold',
    fontSize: 14,
  },
  explanationContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
  },
  yourAnswerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 5,
  },
  correctAnswerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
    marginBottom: 5,
  },
  answerText: {
    fontSize: 14,
    color: '#333',
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F8EF7',
    marginTop: 10,
    marginBottom: 5,
  },
  buttonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 25,
    height: 50,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  matchingAnswerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  matchingAnswerItem: {
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
    margin: 2,
  },
  orderingAnswerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  orderingAnswerItem: {
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
    margin: 2,
  },
  multipleBlanksAnswerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  multipleBlanksAnswerItem: {
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
    margin: 2,
  },
  categoriesAnswerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryGroup: {
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  categoryItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryItem: {
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
    margin: 2,
  },
});

export default TestResultScreen; 