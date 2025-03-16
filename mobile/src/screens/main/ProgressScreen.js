import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Card, Divider, Icon } from '@rneui/themed';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';

const ProgressScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await api.getProgress();
      setProgress(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load progress data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon type="ionicon" name="alert-circle-outline" size={50} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchProgress}>
          Tap to retry
        </Text>
      </View>
    );
  }

  // Format completed tests data for display
  const recentTests = progress?.completedTests?.map(test => ({
    id: test.testId._id || test.testId,
    name: test.testId.title || 'Test',
    score: test.score,
    date: test.completedAt,
  })) || [];

  // Calculate completed courses and lessons count
  const completedLessons = progress?.completedLessons?.length || 0;
  const completedTests = progress?.completedTests?.length || 0;

  // Estimate next level progress (this would need to be calculated based on your app's logic)
  const calculateNextLevelProgress = () => {
    const currentLevel = progress?.currentLevel || 'A1';
    const levels = ['A1', 'A2', 'B1', 'B2'];
    const currentLevelIndex = levels.indexOf(currentLevel);
    
    if (currentLevelIndex === levels.length - 1) {
      return 100; // Already at max level
    }
    
    // Simple calculation based on completed lessons and tests
    // This should be adjusted based on your app's specific requirements
    const totalRequired = 10; // Example: 10 lessons/tests to advance to next level
    const completed = completedLessons + completedTests;
    return Math.min(Math.round((completed / totalRequired) * 100), 100);
  };

  const nextLevelProgress = calculateNextLevelProgress();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Your Learning Journey</Text>
        <Text style={styles.headerSubtitle}>
          Track your progress and achievements
        </Text>
      </View>

      {/* Summary Card */}
      <Card containerStyle={styles.summaryCard}>
        <Card.Title style={styles.cardTitle}>Progress Summary</Card.Title>
        <Card.Divider />
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {/* Estimate completed courses based on unique course IDs in completed lessons */}
              {new Set(progress?.completedLessons?.map(lesson => 
                lesson.course || lesson
              ) || []).size || 0}
            </Text>
            <Text style={styles.summaryLabel}>Courses</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{completedLessons}</Text>
            <Text style={styles.summaryLabel}>Lessons</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{completedTests}</Text>
            <Text style={styles.summaryLabel}>Tests</Text>
          </View>
        </View>
      </Card>

      {/* Current Level */}
      <Card containerStyle={styles.levelCard}>
        <View style={styles.levelContainer}>
          <View style={styles.levelTextContainer}>
            <Text style={styles.levelLabel}>Current Level</Text>
            <Text style={styles.levelValue}>{progress?.currentLevel || 'A1'}</Text>
            <Text style={styles.levelDescription}>
              {nextLevelProgress}% progress to next level
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${nextLevelProgress}%` }
              ]} 
            />
          </View>
        </View>
      </Card>

      {/* Recent Test Results */}
      <Card containerStyle={styles.testsCard}>
        <Card.Title style={styles.cardTitle}>Recent Test Results</Card.Title>
        <Card.Divider />
        {recentTests.length > 0 ? (
          <FlatList
            data={recentTests}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.testItem}>
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{item.name}</Text>
                  <Text style={styles.testDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.scoreContainer, { backgroundColor: getScoreColor(item.score) }]}>
                  <Text style={styles.scoreText}>{item.score}%</Text>
                </View>
              </View>
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <Divider style={styles.divider} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No test results yet</Text>
            }
          />
        ) : (
          <Text style={styles.emptyText}>No test results yet</Text>
        )}
      </Card>

      {/* Course Progress - This would need actual course progress data */}
      <Card containerStyle={styles.coursesCard}>
        <Card.Title style={styles.cardTitle}>Course Progress</Card.Title>
        <Card.Divider />
        <Text style={styles.emptyText}>
          Course progress details will be available soon
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4F8EF7',
    textDecorationLine: 'underline',
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#4F8EF7',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  summaryCard: {
    borderRadius: 10,
    marginTop: -20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F8EF7',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  levelCard: {
    borderRadius: 10,
    marginTop: 10,
  },
  levelContainer: {
    padding: 10,
  },
  levelTextContainer: {
    marginBottom: 15,
  },
  levelLabel: {
    fontSize: 14,
    color: '#666',
  },
  levelValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  levelDescription: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4F8EF7',
  },
  testsCard: {
    borderRadius: 10,
    marginTop: 10,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  testDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  scoreContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  divider: {
    marginVertical: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  coursesCard: {
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  courseItem: {
    paddingVertical: 10,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  courseProgressContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  courseProgressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  courseProgressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
});

export default ProgressScreen; 