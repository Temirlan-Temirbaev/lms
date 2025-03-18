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
import { Tab, TabView, Icon, Divider } from '@rneui/themed';
import * as api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const CourseDetailScreen = ({ route, navigation }) => {
  const { courseId, level } = route.params;
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const courseResponse = await api.getCourse(courseId);
      setCourse(courseResponse.data);

      const lessonsResponse = await api.getCourseLessons(courseId);
      setLessons(lessonsResponse.data);

      const testsResponse = await api.getCourseTests(courseId);
      setTests(testsResponse.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load course details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return user?.progress?.completedLessons?.some(
      (id) => id === lessonId || id._id === lessonId
    );
  };

  const isTestCompleted = (testId) => {
    return user?.progress?.completedTests?.some(
      (test) => test.testId === testId || test.testId?._id === testId
    );
  };

  const getTestScore = (testId) => {
    const test = user?.progress?.completedTests?.find(
      (test) => test.testId === testId || test.testId?._id === testId
    );
    return test ? test.score : null;
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

  const renderLessonItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        isLessonCompleted(item._id) && styles.completedItem,
      ]}
      onPress={() => navigation.navigate('Lesson', {
        lessonId: item._id,
        title: item.title,
      })}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemIconContainer}>
          <Icon
            name="book-outline"
            type="ionicon"
            size={24}
            color={isLessonCompleted(item._id) ? '#4CAF50' : '#666'}
          />
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemOrder}>Lesson {item.order}</Text>
        </View>
        <View style={styles.itemStatusContainer}>
          {isLessonCompleted(item._id) ? (
            <Icon name="checkmark-circle" type="ionicon" size={24} color="#4CAF50" />
          ) : (
            <Icon name="chevron-forward" type="ionicon" size={24} color="#666" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTestItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        isTestCompleted(item._id) && styles.completedItem,
      ]}
      onPress={() => navigation.navigate('Test', {
        testId: item._id,
        title: item.title,
      })}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemIconContainer}>
          <Icon
            name="clipboard-outline"
            type="ionicon"
            size={24}
            color={isTestCompleted(item._id) ? '#4CAF50' : '#666'}
          />
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {/* <Text style={styles.itemDescription}>{item.description}</Text> */}
          {isTestCompleted(item._id) && (
            <Text style={styles.scoreText}>
              Score: {parseInt(getTestScore(item._id))}%
            </Text>
          )}
        </View>
        <View style={styles.itemStatusContainer}>
          {isTestCompleted(item._id) ? (
            <Icon name="checkmark-circle" type="ionicon" size={24} color="#4CAF50" />
          ) : (
            <Icon name="chevron-forward" type="ionicon" size={24} color="#666" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F8EF7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.levelBadge}>
          <Text style={[styles.levelText, { backgroundColor: getLevelColor(level) }]}>
            {level}
          </Text>
        </View>
        <Text style={styles.courseDescription}>{course?.description}</Text>
      </View>

      <Tab
        value={tabIndex}
        onChange={setTabIndex}
        indicatorStyle={{ backgroundColor: 'white' }}
        // variant="primary"
      >
        <Tab.Item
          title="Lessons"
          titleStyle={styles.tabTitle}
          icon={{ name: 'book-outline', type: 'ionicon', color: tabIndex === 0 ? '#4F8EF7' : 'gray' }}
        />
        <Tab.Item
          title="Tests"
          titleStyle={styles.tabTitle}
          icon={{ name: 'clipboard-outline', type: 'ionicon', color: tabIndex === 1 ? '#4F8EF7' : 'gray' }}
        />
      </Tab>

      <TabView value={tabIndex} onChange={setTabIndex} animationType="spring">
        <TabView.Item style={styles.tabContent}>
          {lessons.length > 0 ? (
            <FlatList
              data={lessons}
              renderItem={renderLessonItem}
              keyExtractor={(item) => item._id}
              ItemSeparatorComponent={() => <Divider style={styles.divider} />}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No lessons available</Text>
            </View>
          )}
        </TabView.Item>

        <TabView.Item style={styles.tabContent}>
          {tests.length > 0 ? (
            <FlatList
              data={tests}
              renderItem={renderTestItem}
              keyExtractor={(item) => item._id}
              ItemSeparatorComponent={() => <Divider style={styles.divider} />}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tests available</Text>
            </View>
          )}
        </TabView.Item>
      </TabView>
    </View>
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
  headerContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  levelBadge: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  courseDescription: {
    fontSize: 16,
    color: '#666',
  },
  tabTitle: {
    fontSize: 14,
    color: '#4F8EF7',
  },
  tabContent: {
    width: '100%',
  },
  listContainer: {
    flexGrow: 1,
  },
  divider: {
    backgroundColor: '#e0e0e0',
    height: 1,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  completedItem: {
    backgroundColor: '#f9fff9',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconContainer: {
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemOrder: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  itemStatusContainer: {
    marginLeft: 10,
  },
  scoreText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default CourseDetailScreen; 