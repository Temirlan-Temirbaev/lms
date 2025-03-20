import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Card, Icon, Button } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import * as api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import CustomOverlay from '../../components/CustomOverlay';

const ProgressScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getUserProgress();
      setProgress(response.data);
    } catch (err) {
      setError(t('progress.error'));
      CustomOverlay({
        title: t('progress.error'),
        message: t('progress.errorMessage'),
        platform: Platform.OS
      });
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCourseProgress = (course) => {
    if (!course) return 0;
    const totalLessons = course.lessons?.length || 0;
    const completedLessons = user?.progress?.completedLessons?.filter(
      lesson => course.lessons?.some(l => l._id === (lesson._id || lesson))
    ).length || 0;
    
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };

  const renderCourseProgress = (course) => {
    if (!course) return null;

    const progressPercentage = calculateCourseProgress(course);
    const completedLessons = user?.progress?.completedLessons?.filter(
      lesson => course.lessons?.some(l => l._id === (lesson._id || lesson))
    ).length || 0;
    const totalLessons = course.lessons?.length || 0;

    return (
      <Card key={course._id} containerStyle={styles.courseCard}>
        <View style={styles.courseHeader}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.levelBadge}>{course.level}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {t('progress.lessonsCompleted', {
              completed: completedLessons,
              total: totalLessons
            })}
          </Text>
        </View>

        <View style={styles.courseStats}>
          <View style={styles.statItem}>
            <Icon name="book-outline" type="ionicon" size={20} color="#666" />
            <Text style={styles.statText}>
              {completedLessons}/{totalLessons}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={styles.loadingText}>{t('progress.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" type="ionicon" size={60} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title={t('progress.tryAgain')}
          onPress={fetchProgress}
          buttonStyle={styles.retryButton}
        />
      </View>
    );
  }

  if (!progress || !progress.courses || progress.courses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noDataText}>{t('progress.noProgress')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>{t('progress.overview')}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {user?.progress?.completedLessons?.length || 0}
            </Text>
            <Text style={styles.statLabel}>{t('progress.completedLessons')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {user?.progress?.completedTests?.length || 0}
            </Text>
            <Text style={styles.statLabel}>{t('progress.completedTests')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.coursesSection}>
        <Text style={styles.sectionTitle}>{t('progress.courseProgress')}</Text>
        {progress.courses.map(course => renderCourseProgress(course))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.darkGray,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  overviewSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.black,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 5,
  },
  courseCard: {
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    backgroundColor: colors.white,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  levelBadge: {
    backgroundColor: colors.primary,
    color: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 5,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
    color: colors.darkGray,
  },
});

export default ProgressScreen; 