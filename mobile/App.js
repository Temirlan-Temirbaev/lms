import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n/i18n';
import { LanguageProvider } from './src/context/LanguageContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LanguageProvider>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
