import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import kk from './translations/kk';
import ru from './translations/ru';

const LANGUAGE_STORAGE_KEY = '@app_language';

const resources = {
  kk: {
    translation: kk,
  },
  ru: {
    translation: ru,
  },
};

const getStoredLanguage = async () => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return language || 'kk'; // Default to Kazakh if no language is stored
  } catch (error) {
    console.error('Error reading language from storage:', error);
    return 'kk';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'kk',
    fallbackLng: 'kk',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
  });

// Load the stored language preference
getStoredLanguage().then(language => {
  i18n.changeLanguage(language);
});

export default i18n; 