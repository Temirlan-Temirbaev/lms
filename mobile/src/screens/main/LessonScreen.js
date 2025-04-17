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
  TouchableOpacity,
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
import ImageOverlay from '../../components/ImageOverlay';

const LessonScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const { user, refreshUser } = useAuth();
  const [audioUrls, setAudioUrls] = useState([]);
  const [contentSegments, setContentSegments] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

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
      minHeight: 100,
    },
    tableCell: {
      flex: 1,
      padding: 10,
      borderRightWidth: 1,
      borderRightColor: '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 100,
      flexWrap: 'wrap',
      overflow: 'hidden',
    },
    tableHeaderText: {
      fontWeight: 'bold',
      fontSize: 18,
      color: '#333',
      textAlign: 'center',
    },
    tableCellText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      flexWrap: 'wrap',
      flexShrink: 1,
    },
  });

  const renderRules = {
    image: (node) => {
      const imageUrl = node.attributes.src;
      return (
        <TouchableOpacity
          onPress={() => {
            console.log('Image pressed:', imageUrl);
            setSelectedImage(imageUrl);
          }}
          activeOpacity={0.7}
          style={{ width: '100%' }}
        >
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: 200, resizeMode: 'contain', marginVertical: 10 }}
          />
        </TouchableOpacity>
      );
    },
    link: (node, children, parent, styles) => {
      const url = node.attributes.href;
      if (url.endsWith('.mp3') || url.endsWith('.m4a')) {
        return null;
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
      const hasImage = node.children?.some(child => child.type === 'image');
      const imageNode = node.children?.find(child => child.type === 'image');
      
      // Get all text content from the node
      const getTextContent = (node) => {
        if (!node) return '';
        if (node.type === 'text') return node.content;
        if (node.children) {
          return node.children.map(child => getTextContent(child)).join('');
        }
        return '';
      };

      const textContent = getTextContent(node);

      return (
        <View style={tableStyles.tableHeaderCell}>
          {hasImage && imageNode && (
            <TouchableOpacity
              onPress={() => {
                console.log('Table header image pressed:', imageNode.attributes.src);
                setSelectedImage(imageNode.attributes.src);
              }}
              activeOpacity={0.7}
              style={{ width: '100%', height: 100 }}
            >
              <Image
                source={{ uri: imageNode.attributes.src }}
                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
              />
            </TouchableOpacity>
          )}
          {textContent && textContent.trim() !== '' && (
            <Text style={tableStyles.tableHeaderText}>
              {textContent}
            </Text>
          )}
        </View>
      );
    },
    
    td: (node, children, parent, styles) => {
      // Check if the cell content is an image
      const hasImage = node.children?.some(child => child.type === 'image');
      const imageNode = node.children?.find(child => child.type === 'image');
      
      // Get all text content from the node
      const getTextContent = (node) => {
        if (!node) return '';
        if (node.type === 'text') return node.content;
        if (node.children) {
          return node.children.map(child => getTextContent(child)).join('');
        }
        return '';
      };

      const textContent = getTextContent(node);

      return (
        <View style={tableStyles.tableCell}>
          {hasImage && imageNode && (
            <TouchableOpacity
              onPress={() => {
                console.log('Table cell image pressed:', imageNode.attributes.src);
                setSelectedImage(imageNode.attributes.src);
              }}
              activeOpacity={0.7}
              style={{ width: '100%', height: 100 }}
            >
              <Image
                source={{ uri: imageNode.attributes.src }}
                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
              />
            </TouchableOpacity>
          )}
          {textContent && textContent.trim() !== '' && (
            <Text style={tableStyles.tableCellText}>
              {textContent}
            </Text>
          )}
        </View>
      );
    },
  };

  useEffect(() => {
    if (!lesson?.content) return;

    const processContent = (content) => {
      const audioRegex = /\[.*?\]\((.*?\.(?:mp3|m4a))\)/g;
      let lastIndex = 0;
      const segments = [];
      const urls = [];
      let match;

      // Process all audio links
      while ((match = audioRegex.exec(content)) !== null) {
        // Add the text before the audio link
        if (match.index > lastIndex) {
          segments.push(content.substring(lastIndex, match.index));
        }
        
        // Add the audio URL
        urls.push(match[1].trim());
        
        // Update the last index
        lastIndex = match.index + match[0].length;
      }

      // Add any remaining content after the last audio link
      if (lastIndex < content.length) {
        segments.push(content.substring(lastIndex));
      }

      return {
        segments: segments.filter(segment => segment.trim() !== ''),
        audioUrls: urls
      };
    };

    const { segments, audioUrls } = processContent(lesson.content.toString());
    setAudioUrls(audioUrls);
    setContentSegments(segments);
  }, [lesson?.content]);

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
          {contentSegments.map((segment, index) => (
            <React.Fragment key={index}>
              <Markdown 
                style={markdownStyles} 
                rules={renderRules}
              >
                {segment}
              </Markdown>

              {index < audioUrls.length && (
                <View style={styles.audioWrapper}>
                  <AudioSlider audio={audioUrls[index]} />
                </View>
              )}
            </React.Fragment>
          ))}
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

      <ImageOverlay
        isVisible={!!selectedImage}
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
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
  audioWrapper: {
    marginBottom: 20,
    width: '100%',
  },
});

export default LessonScreen; 