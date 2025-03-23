import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import CourseDetailScreen from '../screens/main/CourseDetailScreen';
import LessonScreen from '../screens/main/LessonScreen';
import TestScreen from '../screens/main/TestScreen';
import TestResultScreen from '../screens/main/TestResultScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import ChangePasswordScreen from '../screens/main/ChangePasswordScreen';
import ProgressScreen from '../screens/main/ProgressScreen';
import PlacementTestScreen from '../screens/main/PlacementTestScreen';
import PlacementTestResultScreen from '../screens/main/PlacementTestResultScreen';

// Auth Context
import { useAuth } from '../context/AuthContext';

// Create stacks
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const PlacementTestStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          color: colors.black,
        },
      }}
    >
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: t('navigation.login') }}
      />
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: t('navigation.register') }}
      />
    </AuthStack.Navigator>
  );
};

// Home Stack Navigator
const HomeStackNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          color: colors.black,
        },
        headerShadowVisible: false,
        headerBackTitle: "",
      }}
    >
      <HomeStack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ title: t('navigation.courses') }}
      />
      <HomeStack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen} 
        options={({ route }) => ({ 
          title: route.params?.title || t('navigation.courseDetails')
        })}
      />
      <HomeStack.Screen 
        name="Lesson" 
        component={LessonScreen} 
        options={({ route }) => ({ 
          title: route.params?.title || t('navigation.lesson')
        })}
      />
      <HomeStack.Screen 
        name="Test" 
        component={TestScreen} 
        options={({ route }) => ({ 
          title: route.params?.title || t('navigation.test')
        })}
      />
      <HomeStack.Screen 
        name="TestResult" 
        component={TestResultScreen} 
        options={{ title: t('navigation.testResults') }}
      />
    </HomeStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          color: colors.black,
        },
        headerShadowVisible: false,
        headerBackTitle: "",
      }}
    >
      <ProfileStack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen} 
        options={{ title: t('navigation.profile') }}
      />
      <ProfileStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: t('navigation.editProfile') }}
      />
      <ProfileStack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{ title: t('navigation.changePassword') }}
      />
      <ProfileStack.Screen 
        name="Progress" 
        component={ProgressScreen} 
        options={{ title: t('navigation.myProgress') }}
      />
    </ProfileStack.Navigator>
  );
};

// Placement Test Stack Navigator
const PlacementTestNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <PlacementTestStack.Navigator 
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          color: colors.black,
        },
      }}
    >
      <PlacementTestStack.Screen 
        name="PlacementTest" 
        component={PlacementTestScreen}
        options={{ title: t('navigation.placementTest') }}
      />
      <PlacementTestStack.Screen 
        name="PlacementTestResult" 
        component={PlacementTestResultScreen}
        options={{ title: t('navigation.placementTestResult') }}
      />
    </PlacementTestStack.Navigator>
  );
};

// Tab Navigator
const TabNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} type="ionicon" size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.darkGray,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{ title: t('navigation.home') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{ title: t('navigation.profile') }}
      />
    </Tab.Navigator>
  );
};

// Main Navigator
const MainNavigator = () => {
  const { hasPlacementTest } = useAuth();

  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {hasPlacementTest ? (
        <MainStack.Screen name="PlacementTestFlow" component={PlacementTestNavigator} />
      ) : (
        <MainStack.Screen name="Main" component={TabNavigator} />
      )}
    </MainStack.Navigator>
  );
};

// App Navigator
const AppNavigator = () => {
  const { token, loading } = useAuth();

  if (loading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator; 