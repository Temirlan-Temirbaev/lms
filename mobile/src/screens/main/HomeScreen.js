import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Card, Icon, Button } from '@rneui/themed';
import * as api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, hasPlacementTest, refreshUser } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.getCourses();
      setCourses(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakePlacementTest = () => {
    navigation.navigate('PlacementTestFlow');
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'A1':
        return '#4CAF50'; // Green
      case 'A2':
        return '#8BC34A'; // Light Green
      case 'B1':
        return '#FFC107'; // Amber
      case 'B2':
        return '#FF9800'; // Orange
      default:
        return '#4F8EF7'; // Default blue
    }
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
        <View style={styles.levelBadge}>
          <Text style={[styles.levelText, { backgroundColor: getLevelColor(item.level) }]}>
            {item.level}
          </Text>
        </View>
        
        <Card.Title style={styles.courseTitle}>{item.title}</Card.Title>
        <Card.Divider />
        <Text style={styles.courseDescription}>{item.description}</Text>
        
        {/* <View style={styles.courseFooter}>
          <View style={styles.courseStats}>
            <Icon name="book-outline" type="ionicon" size={16} color="#666" />
            <Text style={styles.statsText}>{item.lessons?.length || 0} Lessons</Text>
          </View>
          <View style={styles.courseStats}>
            <Icon name="clipboard-outline" type="ionicon" size={16} color="#666" />
            <Text style={styles.statsText}>{item.tests?.length || 0} Tests</Text>
          </View>
        </View> */}
        
        {isCurrentLevel(item.level) && (
          <View style={styles.currentLevelBadge}>
            <Text style={styles.currentLevelText}>Current Level</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const renderPlacementTestBanner = () => {
    if (!user?.progress?.placementTestTaken) {
      return (
        <Card containerStyle={styles.placementTestCard}>
          <View style={styles.placementTestContent}>
            <View style={styles.placementTestTextContainer}>
              <Text style={styles.placementTestTitle}>Take the Placement Test</Text>
              <Text style={styles.placementTestDescription}>
                Find your current language level and unlock appropriate courses.
              </Text>
            </View>
            <Button
              title="Start Test"
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
  },
  courseCard: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentLevelCard: {
    borderWidth: 2,
    borderColor: '#4F8EF7',
  },
  levelBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  courseTitle: {
    fontSize: 18,
    marginTop: 5,
    marginBottom: 5,
  },
  courseDescription: {
    color: '#666',
    marginBottom: 15,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  currentLevelBadge: {
    position: 'absolute',
    top: -10,
    left: 10,
    backgroundColor: '#4F8EF7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  currentLevelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  placementTestCard: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  placementTestContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placementTestTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  placementTestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 5,
  },
  placementTestDescription: {
    fontSize: 14,
    color: '#546E7A',
  },
  placementTestButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
});

export default HomeScreen; 