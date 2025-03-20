import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Button } from '@rneui/themed';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from 'react-i18next';
import * as api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { Image } from 'react-native';
import { SimpleAudioPlayer } from './AudioPlayer'
import { AudioSlider } from './AudioSlider';
import { CustomOverlay } from '../../components/CustomOverlay';
import { colors } from '../../theme/colors';

const LessonScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
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
      CustomOverlay({
        title: t('lesson.error'),
        message: t('lesson.loadError'),
        platform: Platform.OS
      });
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
      CustomOverlay({
        title: t('lesson.success'),
        message: t('lesson.completedSuccess'),
        platform: Platform.OS
      });
    } catch (error) {
      CustomOverlay({
        title: t('lesson.error'),
        message: t('lesson.completeError'),
        platform: Platform.OS
      });
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
      color: colors.primary,
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

  const tableStyles = StyleSheet.create({
    table: {
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      marginVertical: 10,
      backgroundColor: '#fff',
    },
    tableHeader: {
      backgroundColor: '#f5f5f5',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    tableBody: {
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    tableHeaderCell: {
      flex: 1,
      padding: 10,
      borderRightWidth: 1,
      borderRightColor: '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tableCell: {
      flex: 1,
      padding: 10,
      borderRightWidth: 1,
      borderRightColor: '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tableHeaderText: {
      fontWeight: 'bold',
      fontSize: 14,
      color: '#333',
    },
    tableCellText: {
      fontSize: 14,
      color: '#666',
    },
  });

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
    table: (node, children, parent, styles) => (
      <View style={tableStyles.table}>
        {children}
      </View>
    ),
    
    thead: (node, children, parent, styles) => (
      <View style={tableStyles.tableHeader}>
        {children}
      </View>
    ),
    
    tbody: (node, children, parent, styles) => (
      <View style={tableStyles.tableBody}>
        {children}
      </View>
    ),
    
    tr: (node, children, parent, styles) => (
      <View style={tableStyles.tableRow}>
        {children}
      </View>
    ),
    
    th: (node, children, parent, styles) => {
      // Check if the header content is an image
      const hasImage = node.children?.[0]?.type === 'image';
      
      if (hasImage) {
        const imageNode = node.children[0];
        return (
          <View style={tableStyles.tableHeaderCell}>
            <Image
              source={{ uri: imageNode.attributes.src }}
              style={{ width: '100%', height: 100, resizeMode: 'contain' }}
            />
          </View>
        );
      }

      // Regular text header
      return (
        <View style={tableStyles.tableHeaderCell}>
          <Text style={tableStyles.tableHeaderText}>
            {children}
          </Text>
        </View>
      );
    },
    
    td: (node, children, parent, styles) => {
      // Check if the cell content is an image
      const hasImage = node.children?.[0]?.type === 'image';
      
      if (hasImage) {
        const imageNode = node.children[0];
        return (
          <View style={tableStyles.tableCell}>
            <Image
              source={{ uri: imageNode.attributes.src }}
              style={{ width: '100%', height: 100, resizeMode: 'contain' }}
            />
          </View>
        );
      }

      // Regular text cell
      return (
        <View style={tableStyles.tableCell}>
          <Text style={tableStyles.tableCellText}>
            {children}
          </Text>
        </View>
      );
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={styles.loadingText}>{t('lesson.loading')}</Text>
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
          {lesson.content.toString()}
        </Markdown>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {isLessonCompleted() ? (
          <Button
            title={t('lesson.completed')}
            disabled
            icon={{ name: 'checkmark-circle', type: 'ionicon', color: 'white' }}
            buttonStyle={styles.completedButton}
          />
        ) : (
          <Button
            title={t('lesson.markAsCompleted')}
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
    backgroundColor: colors.white,
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
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
  },
  completedButton: {
    backgroundColor: colors.success,
    borderRadius: 25,
    height: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.darkGray,
  },
});

export default LessonScreen; 