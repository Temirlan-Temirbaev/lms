import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Button, Icon, Divider } from '@rneui/themed';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const PlacementTestResultScreen = ({ route, navigation }) => {
  const { results } = route.params;
  const { refreshUser } = useAuth();
  
  const getLevelColor = (level) => {
    switch (level) {
      case 'A1': return '#4CAF50'; // Green
      case 'A2': return '#8BC34A'; // Light Green
      case 'B1': return '#FFC107'; // Amber
      case 'B2': return '#FF5722'; // Deep Orange
      default: return '#4F8EF7'; // Blue
    }
  };
  
  const getLevelDescription = (level) => {
    switch (level) {
      case 'A1': return 'Beginner';
      case 'A2': return 'Elementary';
      case 'B1': return 'Intermediate';
      case 'B2': return 'Upper Intermediate';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Icon
            name="school"
            type="ionicon"
            size={60}
            color="#4F8EF7"
            containerStyle={styles.iconContainer}
          />
          <Text style={styles.headerTitle}>Placement Test Results</Text>
        </View>
        
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Your Language Level</Text>
          
          <View style={[
            styles.levelBadge,
            { backgroundColor: getLevelColor(results.data.assignedLevel) }
          ]}>
            <Text style={styles.levelText}>
              {results.data.assignedLevel} - {getLevelDescription(results.data.assignedLevel)}
            </Text>
          </View>
          
          <Text style={styles.resultDescription}>
            Based on your test results, you have been placed at {results.data.assignedLevel} level.
            You now have access to the following course levels:
          </Text>
          
          <View style={styles.availableLevelsContainer}>
            {results.data.availableLevels.map((level, index) => (
              <View 
                key={index}
                style={[
                  styles.levelChip,
                  { backgroundColor: getLevelColor(level) }
                ]}
              >
                <Text style={styles.levelChipText}>{level}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>Performance by Level</Text>
          
          <View style={styles.scoreGrid}>
            {Object.entries(results.data.levelScores).map(([level, score], index) => (
              <View key={index} style={styles.scoreItem}>
                <View style={[
                  styles.scoreCircle,
                  { borderColor: getLevelColor(level) }
                ]}>
                  <Text style={[
                    styles.scoreText,
                    { color: getLevelColor(level) }
                  ]}>
                    {Math.round(score)}%
                  </Text>
                </View>
                <Text style={styles.scoreLabel}>{level}</Text>
              </View>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.overallScoreContainer}>
            <Text style={styles.overallScoreLabel}>Overall Score</Text>
            <Text style={styles.overallScoreText}>
              {Math.round(results.data.overallScore)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.nextStepsContainer}>
          <Text style={styles.nextStepsTitle}>Next Steps</Text>
          <Text style={styles.nextStepsText}>
            You can now start learning at your assigned level. We recommend beginning with the {results.data.assignedLevel} course.
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Start Learning"
          onPress={() => navigation.replace('HomeScreen')}
          buttonStyle={styles.startButton}
          icon={{ name: 'school', type: 'ionicon', color: 'white' }}
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
  headerContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  iconContainer: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  resultContainer: {
    padding: 20,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  levelBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 15,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  resultDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  availableLevelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  levelChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    margin: 5,
  },
  levelChipText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  scoreGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  scoreItem: {
    alignItems: 'center',
    margin: 10,
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    backgroundColor: '#e0e0e0',
    height: 1,
    marginVertical: 15,
  },
  overallScoreContainer: {
    alignItems: 'center',
  },
  overallScoreLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  overallScoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F8EF7',
  },
  nextStepsContainer: {
    padding: 20,
  },
  nextStepsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  nextStepsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    height: 50,
  },
});

export default PlacementTestResultScreen; 