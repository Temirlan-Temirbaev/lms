import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API
// const API_URL = 'https://qazaqshapp.kz/api/api'; // For iOS simulator
// const API_URL = 'http://10.0.2.2:5001/api'; // For Android emulator
const API_URL = 'http://localhost:5001/api';
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
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = 
      error.response?.data?.message || 
      error.message || 
      'Something went wrong';
    
    return Promise.reject({ message });
  }
);

// Authentication APIs
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// User APIs
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateUserDetails = async (userData) => {
  const response = await api.put('/auth/updatedetails', userData);
  return response.data;
};

export const updatePassword = async (passwordData) => {
  const response = await api.put('/auth/updatepassword', passwordData);
  return response.data;
};

// Course APIs
export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const getCourseById = async (courseId) => {
  const response = await api.get(`/courses/${courseId}`);
  return response.data;
};

export const getCourseLessons = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/lessons`);
  return response.data;
};

export const getCourseTests = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/tests`);
  return response.data;
};

// Lesson APIs
export const getLessonById = async (lessonId) => {
  const response = await api.get(`/courses/lessons/${lessonId}`);
  return response.data;
};

export const completeLesson = async (lessonId) => {
  const response = await api.post(`/courses/lessons/${lessonId}/complete`);
  return response.data;
};

// Test APIs
export const getTestById = async (testId) => {
  const response = await api.get(`/courses/tests/${testId}`);
  return response.data;
};

export const submitTestAnswers = async (testId, answers) => {
  const response = await api.post(`/courses/tests/${testId}/submit`, { answers });
  return response.data;
};

// Progress APIs
export const getProgress = async () => {
  const response = await api.get('/users/progress');
  return response.data;
};

export const updateUserLevel = async (level) => {
  const response = await api.put('/users/level', { level });
  return response.data;
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send reset email');
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export const resetPassword = async (email, newPassword, otp) => {
  try {
    const response = await api.post('/auth/reset-password', {
      email,
      newPassword,
      otp
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset password' };
  }
};

export default api; 