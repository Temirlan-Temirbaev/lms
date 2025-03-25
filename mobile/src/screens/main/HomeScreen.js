import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Card, Icon, Button } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import * as api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import CustomOverlay from '../../components/CustomOverlay';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Add this import at the top

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, hasPlacementTest, refreshUser } = useAuth();

  const course = [{
    "_id": {
      "$oid": "67d735f23fb6502bc9b23e48"
    },
    "level": "A2",
    "title": "Бастапқы деңгей - A2",
    "description": "Elementary language skills for basic communication.",
    "lessons": [],
    "tests": [],
    "createdAt": {
      "$date": "2025-03-16T20:34:58.665Z"
    },
    "updatedAt": {
      "$date": "2025-03-16T20:34:58.665Z"
    },
    "__v": 0
  }]

  useEffect(() => {
    fetchCourses();
    // setCourses(course)
    // setLoading(false)
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.getCourses();
      setCourses(response.data);
  
      // Set language from user settings when component mounts
      if (user?.settings?.language) {
        i18n.changeLanguage(user.settings.language);
      }
    } catch (error) {
      CustomOverlay({
        title: t('home.error'),
        message: t('home.loadError'),
        platform: Platform.OS
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakePlacementTest = () => {
    navigation.navigate('PlacementTestFlow');
  };

  const getLevelColor = (level) => {
    return colors.levels[level] || colors.primary;
  };

  const isCurrentLevel = (level) => {
    return user?.progress?.currentLevel === level;
  };

  const renderCourseItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('CourseDetail', {
        courseId: item._id,
        title: item.title,
        level: item.level,
      })}
    >
      <Card containerStyle={[
        styles.courseCard,
        isCurrentLevel(item.level) && styles.currentLevelCard
      ]}>
        
        {/* Moved the Level Badge inside a flex container to avoid overlap */}
        
  
        {/* Increased margin-bottom for better spacing */}
        <Card.Title style={styles.courseTitle}>{item.title}</Card.Title>
        <Card.Divider />
  
        {/* Increased font size and line height for better readability */}
        {/* <Text style={styles.courseDescription}>{item.description}</Text> */}
  
        {/* Unhid and improved Course Footer layout */}
        {/* <View style={styles.courseFooter}>
          <View style={styles.courseStats}>
            <Icon name="book-outline" type="ionicon" size={16} color="#666" />
            <Text style={styles.statsText}>
              {t('home.lessons', { count: item.lessons?.length || 0 })}
            </Text>
          </View>
          <View style={styles.courseStats}>
            <Icon name="clipboard-outline" type="ionicon" size={16} color="#666" />
            <Text style={styles.statsText}>
              {t('home.tests', { count: item.tests?.length || 0 })}
            </Text>
          </View>
        </View> */}
  
        {/* Moved Current Level Badge inside the card for better placement */}
        {isCurrentLevel(item.level) && (
          <View style={styles.currentLevelBadge}>
            <Text style={styles.currentLevelText}>
              {t('home.currentLevel')}
            </Text>
          </View>
        )}

        <View style={styles.levelBadge}>
          <Text style={[styles.levelText, { backgroundColor: getLevelColor(item.level) }]}>
            {item.level}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderPlacementTestBanner = () => {
    if (!user?.progress?.placementTestTaken) {
      return (
        <Card containerStyle={styles.placementTestCard}>
          <View style={styles.placementTestContent}>
            <View style={styles.placementTestTextContainer}>
              <Text style={styles.placementTestTitle}>
                {t('home.placementTest.title')}
              </Text>
              <Text style={styles.placementTestDescription}>
                {t('home.placementTest.description')}
              </Text>
            </View>
            <Button
              title={t('home.placementTest.startButton')}
              onPress={handleTakePlacementTest}
              buttonStyle={styles.placementTestButton}
              icon={{
                name: 'school',
                type: 'ionicon',
                color: 'white',
                size: 16,
                style: { marginRight: 8 }
              }}
            />
          </View>
        </Card>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={styles.loadingText}>{t('home.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchCourses}
        ListHeaderComponent={renderPlacementTestBanner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
  },
  courseCard: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 20,
    elevation: 4,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  currentLevelCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  levelBadge: {
    alignSelf: 'flex-end', // Changed from absolute positioning to flex-based alignment
    marginBottom: 10, // Added margin for better spacing
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  courseTitle: {
    fontSize: 20, // Increased font size for better readability
    fontWeight: 'bold',
    marginBottom: 8, // Added margin for spacing
    textAlign: 'left',
    color: colors.black,
  },
  courseDescription: {
    color: colors.darkGray,
    fontSize: 14,
    lineHeight: 20, // Added lineHeight for better readability
    marginBottom: 10,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Changed from space-between for better balance
    marginTop: 10, // Added margin for better separation
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginLeft: 5,
    color: colors.darkGray,
    fontSize: 14,
  },
  currentLevelBadge: {
    alignSelf: 'flex-start', // Moved from absolute positioning to flex alignment
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10, // Added margin for better spacing
  },
  currentLevelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
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
  placementTestCard: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 20,
    backgroundColor: colors.primaryLight,
  },
  placementTestContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placementTestTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  placementTestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  placementTestDescription: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
  placementTestButton: {
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingHorizontal: 20,
  },
  listContainer: {
    padding: 10,
  },
});

export default HomeScreen;