import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tests from './tests'

// Base URL for API requests
// const API_URL = 'http://10.0.2.2:5001/api'; // For Android emulator
const API_URL = 'https://qazaqshapp.kz/api/api'; // For iOS simulator
// const API_URL = 'http://192.168.0.158:5001/api'; 

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in storage'); // Debug log
    }
    return config;
  },
  (error) => {
    console.log('Request interceptor error:', error); // Debug log
    return Promise.reject(error);
  }
);

// Auth API
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const login = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const updateUserDetails = async (userData) => {
  try {
    const response = await api.put('/auth/updatedetails', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const updatePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/updatepassword', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// Courses API
export const getCourses = async () => {
  try {
    const response = await api.get('/courses');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getCourse = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getMockTests = async (courseId) => {
  try {
    console.log("mock", courseId)
    const response = tests.filter((test)=>{
      console.log("isTrue", test.course.$oid === courseId.$oid)
      return test.course.$oid === courseId.$oid
    })
    return response;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
}

export const getMockTest = async (testId) => {
  try {
    const response = tests.filter((test)=>{
      console.log("isTrue", test._id.$oid === testId.$oid)
      return test._id.$oid === testId.$oid
    })
    return response[0];
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getCourseLessons = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/lessons`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getCourseTests = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/tests`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getLesson = async (lessonId) => {
  try {
    const response = await api.get(`/courses/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const completeLesson = async (lessonId) => {
  try {
    const response = await api.post(`/courses/lessons/${lessonId}/complete`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getTest = async (testId) => {
  try {
    const response = await api.get(`/courses/tests/${testId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const submitTest = async (testId, totalPoints, isFinal) => {
  try {
    const response = await api.post(`/courses/tests/${testId}/submit`, { totalPoints, isFinal });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// User Progress API
export const getUserProgress = async () => {
  try {
    const response = await api.get('/users/progress');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const updateUserLevel = async (level) => {
  try {
    const response = await api.put('/users/level', { level });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getPlacementTest = async () => {
  try {
    const response = await api.get('/placement-test');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const submitPlacementTest = async (totalPoints, userId) => {
  try {
    const response = await api.post('/placement-test/submit', { totalPoints, userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// User Settings API
export const updateUserSettings = async (settings) => {
  try {
    const response = await api.put('/users/settings', settings);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export default api;