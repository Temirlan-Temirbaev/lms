import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tests from './tests'

// Base URL for API requests
// const API_URL = 'http://10.0.2.2:5001/api'; // For Android emulator
const API_URL = 'https://qazaqshapp.kz/api/api'; // For iOS simulator
// const API_URL = 'http://localhost:5001/api'; // For iOS simulator
// const API_URL = 'http://192.168.0.158:5001/api'; 
// const API_URL = 'https://fd89-37-150-42-59.ngrok-free.app/api';
// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning' : true
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    console.log('[API Request Interceptor] Original Config:', config.method, config.url); // Log method and URL
    const token = await AsyncStorage.getItem('token');
    console.log('[API Request Interceptor] Token from AsyncStorage:', token); // Log the retrieved token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Request Interceptor] Config with Token:', config.headers); // Log headers after adding token
    } else {
      console.warn('[API Request Interceptor] No token found in AsyncStorage'); // Warn if no token
    }
    return config;
  },
  (error) => {
    console.error('[API Request Interceptor] Error:', error); // Log any request setup error
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('[API Response Interceptor] Success:', response.status, response.config.url); // Log successful responses
    return response;
  },
  (error) => {
    console.error('[API Response Interceptor] Error:', error); // Log the basic error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('[API Response Interceptor] Error Response Data:', error.response.data);
      console.error('[API Response Interceptor] Error Response Status:', error.response.status);
      console.error('[API Response Interceptor] Error Response Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[API Response Interceptor] Error Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('[API Response Interceptor] Error Message:', error.message);
    }
    console.error('[API Response Interceptor] Error Config:', error.config); // Log the config of the failed request

    // Keep the original rejection logic, but use the detailed logged info for debugging
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    return Promise.reject({ message, status: error.response?.status }); // Include status code in rejection
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
    console.log("placement test", response.data) // Debug log
    return response.data;
  } catch (error) {
    console.log("erorrrrorrr", error) // Debug log
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