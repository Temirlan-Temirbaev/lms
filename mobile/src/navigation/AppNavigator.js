import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@rneui/themed';

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
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Home Stack Navigator
const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen 
      name="HomeScreen" 
      component={HomeScreen} 
      options={{ title: 'Courses' }}
    />
    <HomeStack.Screen 
      name="CourseDetail" 
      component={CourseDetailScreen} 
      options={({ route }) => ({ title: route.params?.title || 'Course Details' })}
    />
    <HomeStack.Screen 
      name="Lesson" 
      component={LessonScreen} 
      options={({ route }) => ({ title: route.params?.title || 'Lesson' })}
    />
    <HomeStack.Screen 
      name="Test" 
      component={TestScreen} 
      options={({ route }) => ({ title: route.params?.title || 'Test' })}
    />
    <HomeStack.Screen 
      name="TestResult" 
      component={TestResultScreen} 
      options={{ title: 'Test Results' }}
    />
  </HomeStack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen 
      name="ProfileScreen" 
      component={ProfileScreen} 
      options={{ title: 'Profile' }}
    />
    <ProfileStack.Screen 
      name="EditProfile" 
      component={EditProfileScreen} 
      options={{ title: 'Edit Profile' }}
    />
    <ProfileStack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen} 
      options={{ title: 'Change Password' }}
    />
    <ProfileStack.Screen 
      name="Progress" 
      component={ProgressScreen} 
      options={{ title: 'My Progress' }}
    />
  </ProfileStack.Navigator>
);

// Placement Test Stack Navigator
const PlacementTestNavigator = () => (
  <PlacementTestStack.Navigator screenOptions={{ headerShown: false }}>
    <PlacementTestStack.Screen name="PlacementTest" component={PlacementTestScreen} />
    <PlacementTestStack.Screen name="PlacementTestResult" component={PlacementTestResultScreen} />
  </PlacementTestStack.Navigator>
);

// Tab Navigator
const TabNavigator = () => (
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
      tabBarActiveTintColor: '#4F8EF7',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeStackNavigator} />
    <Tab.Screen name="Profile" component={ProfileStackNavigator} />
  </Tab.Navigator>
);

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