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
import { Image } from 'react-native';
import { SimpleAudioPlayer } from './AudioPlayer'
import { AudioSlider } from './AudioSlider';

const LessonScreen = ({ route, navigation }) => {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const { user, refreshUser } = useAuth();

  const mockLessonData = {
    "_id": "67d735f23fb6502bc9b23e4f",
    "title": "Introduction to Basics",
    "content": "# Greetings and Introductions\n\nHello! Welcome to your first language lesson. In this lesson, we will learn basic greetings and introductions.\n\n## Common Greetings\n\n- **Hello** = Hola\n- **Good morning** = Buenos días\n- **Good afternoon** = Buenas tardes\n- **Good evening** = Buenas noches\n- **How are you?** = ¿Cómo estás?\n- **I'm fine, thank you** = Estoy bien, gracias\n- **What's your name?** = ¿Cómo te llamas?\n- **My name is...** = Me llamo...\n- **Nice to meet you** = Encantado/a de conocerte\n\n## Practice\n\nTry introducing yourself using the phrases above. Remember to practice pronunciation!\n\n### Image Example\n\n![Spanish Greetings](http://s3.tebi.io/i.51sec.org/chrome_Es4dceCxap.png)\n\n### Listen to Pronunciation\n\n[Click to Listen](https://storage.yandexcloud.kz/pleep-bucket/1742297426383Eminem%20-%20Lose%20Yourself.mp3)\n",
    "course": "67d735f23fb6502bc9b23e47",
    "order": 1,
    "createdAt": "2025-03-16T20:34:58.893Z",
    "updatedAt": "2025-03-16T20:34:58.893Z",
    "__v": 0
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);
  
  const fetchLesson = async () => {
    setLoading(true);
    try {
      const response = await api.getLesson(lessonId);
      setLesson(response.data);
      console.log(response.data, "lesson")
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
    // Custom Audio Renderer
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
        <Markdown 
        style={markdownStyles} 
        rules={renderRules}
        >
          {mockLessonData.content.toString()}
        </Markdown>
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