import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Button } from '@rneui/themed';
import Markdown from 'react-native-markdown-display';
import * as api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const LessonScreen = ({ route, navigation }) => {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    setLoading(true);
    try {
      const response = await api.getLesson(lessonId);
      setLesson(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load lesson');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    setCompleting(true);
    try {
      await api.completeLesson(lessonId);
      await refreshUser();
      Alert.alert('Success', 'Lesson marked as completed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark lesson as completed');
      console.error(error);
    } finally {
      setCompleting(false);
    }
  };

  const isLessonCompleted = () => {
    return user?.progress?.completedLessons?.some(
      (id) => id === lessonId || id._id === lessonId
    );
  };

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
      color: '#4F8EF7',
    },
    heading2: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
      color: '#333',
    },
    heading3: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
      color: '#333',
    },
    paragraph: {
      marginBottom: 16,
    },
    list_item: {
      marginBottom: 8,
    },
    bullet_list: {
      marginBottom: 16,
    },
    ordered_list: {
      marginBottom: 16,
    },
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
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Markdown style={markdownStyles}>{lesson?.content}</Markdown>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {isLessonCompleted() ? (
          <Button
            title="Completed"
            disabled
            icon={{ name: 'checkmark-circle', type: 'ionicon', color: 'white' }}
            buttonStyle={styles.completedButton}
          />
        ) : (
          <Button
            title="Mark as Completed"
            loading={completing}
            onPress={handleCompleteLesson}
            icon={{ name: 'checkmark-circle-outline', type: 'ionicon', color: 'white' }}
            buttonStyle={styles.completeButton}
          />
        )}
      </View>
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
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  buttonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  completeButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 25,
    height: 50,
  },
  completedButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    height: 50,
  },
});

export default LessonScreen; 