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
import { Tab, TabView, Icon, Divider } from '@rneui/themed';
import * as api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import CustomOverlay from '../../components/CustomOverlay';

const CourseDetailScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
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
      console.log(courseId, "course")
      const courseResponse = await api.getCourse(courseId);
      setCourse(courseResponse.data);

      const lessonsResponse = await api.getCourseLessons(courseId);
      setLessons(lessonsResponse.data);

      const testsResponse = await api.getCourseTests(courseId);
      setTests(testsResponse.data);

      // const testsResponse = await api.getMockTests(courseId);
      // console.log("testsResponse", testsResponse)
      // setTests(testsResponse);
    } catch (error) {
      CustomOverlay({
        title: t('common.error'),
        message: t('course.loadError'),
        platform: Platform.OS
      });
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
    return colors.levels[level] || colors.primary;
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
            color={isLessonCompleted(item._id) ? colors.success : colors.darkGray}
          />
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {/* <Text style={styles.itemOrder}>
            {t('course.lessonNumber', { number: item.order })}
          </Text> */}
        </View>
        <View style={styles.itemStatusContainer}>
          {isLessonCompleted(item._id) ? (
            <Icon name="checkmark-circle" type="ionicon" size={24} color={colors.success} />
          ) : (
            <Icon name="chevron-forward" type="ionicon" size={24} color={colors.darkGray} />
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
            color={isTestCompleted(item._id) ? colors.success : colors.darkGray}
          />
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {isTestCompleted(item._id) && (
            <View style={styles.scoreContainer}>
              <Icon 
                name="checkmark-circle" 
                type="ionicon" 
                size={16} 
                color={colors.success} 
                style={styles.scoreIcon}
              />
              <Text style={styles.scoreText}>
                Балл {parseInt(getTestScore(item._id))}%
              </Text>
            </View>
          )}
        </View>
        <View style={styles.itemStatusContainer}>
          <Icon 
            name="chevron-forward" 
            type="ionicon" 
            size={24} 
            color={colors.darkGray} 
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {/* <View style={styles.levelBadge}>
          <Text style={[styles.levelText, { backgroundColor: getLevelColor(level) }]}>
            {level}
          </Text>
        </View> */}
        {/* <Text style={styles.courseDescription}>{course?.description}</Text> */}
      </View>

      <Tab
        value={tabIndex}
        onChange={setTabIndex}
        indicatorStyle={{ backgroundColor: colors.white }}
      >
        <Tab.Item
          title={t('course.lessons')}
          titleStyle={[styles.tabTitle, { color: tabIndex === 0 ? colors.primary : colors.darkGray }]}
          icon={{ 
            name: 'book-outline', 
            type: 'ionicon', 
            color: tabIndex === 0 ? colors.primary : colors.darkGray 
          }}
        />
        <Tab.Item
          title={t('course.tests')}
          titleStyle={[styles.tabTitle, { color: tabIndex === 1 ? colors.primary : colors.darkGray }]}
          icon={{ 
            name: 'clipboard-outline', 
            type: 'ionicon', 
            color: tabIndex === 1 ? colors.primary : colors.darkGray 
          }}
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
              <Text style={styles.emptyText}>{t('course.noLessons')}</Text>
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
              <Text style={styles.emptyText}>{t('course.noTests')}</Text>
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
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    // padding: 15,
    backgroundColor: colors.background,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  levelText: {
    color: colors.white,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  courseDescription: {
    fontSize: 16,
    color: colors.darkGray,
  },
  tabTitle: {
    fontSize: 14,
  },
  tabContent: {
    width: '100%',
  },
  listContainer: {
    flexGrow: 1,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: colors.white,
  },
  completedItem: {
    backgroundColor: colors.white,
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
    color: colors.black,
  },
  itemOrder: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 5,
  },
  itemStatusContainer: {
    marginLeft: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  scoreIcon: {
    marginRight: 5,
  },
  scoreText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
  },
});

export default CourseDetailScreen; 