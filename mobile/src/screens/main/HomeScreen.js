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
        
        {/* Moved the Level Badge inside a flex container to avoid overlap */}
        <View style={styles.levelBadge}>
          <Text style={[styles.levelText, { backgroundColor: getLevelColor(item.level) }]}>
            {item.level}
          </Text>
        </View>
  
        {/* Increased margin-bottom for better spacing */}
        <Card.Title style={styles.courseTitle}>{item.title}</Card.Title>
        <Card.Divider />
  
        {/* Increased font size and line height for better readability */}
        <Text style={styles.courseDescription}>{item.description}</Text>
  
        {/* Unhid and improved Course Footer layout */}
        <View style={styles.courseFooter}>
          <View style={styles.courseStats}>
            <Icon name="book-outline" type="ionicon" size={16} color="#666" />
            <Text style={styles.statsText}>{item.lessons?.length || 0} Lessons</Text>
          </View>
          <View style={styles.courseStats}>
            <Icon name="clipboard-outline" type="ionicon" size={16} color="#666" />
            <Text style={styles.statsText}>{item.tests?.length || 0} Tests</Text>
          </View>
        </View>
  
        {/* Moved Current Level Badge inside the card for better placement */}
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
    padding: 10, // Added padding for better spacing
  },
  courseCard: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 20, // Increased padding for better text alignment
    elevation: 4, // Increased elevation for better shadow effect
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // Adjusted shadow height
    shadowOpacity: 0.15, // Increased opacity for better visibility
    shadowRadius: 6, // Increased for a softer effect
  },
  currentLevelCard: {
    borderWidth: 2,
    borderColor: '#4F8EF7',
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
  },
  courseDescription: {
    color: '#666',
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
    color: '#666',
    fontSize: 14,
  },
  currentLevelBadge: {
    alignSelf: 'flex-start', // Moved from absolute positioning to flex alignment
    backgroundColor: '#4F8EF7',
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
});

export default HomeScreen; 