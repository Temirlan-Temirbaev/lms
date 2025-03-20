import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.languageButton,
          currentLanguage === 'kk' && styles.activeLanguage,
        ]}
        onPress={() => changeLanguage('kk')}
      >
        <Text style={styles.languageText}>қаз</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.languageButton,
          currentLanguage === 'ru' && styles.activeLanguage,
        ]}
        onPress={() => changeLanguage('ru')}
      >
        <Text style={styles.languageText}>рус</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
  },
  languageButton: {
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeLanguage: {
    backgroundColor: '#4F8EF7',
    borderColor: '#4F8EF7',
  },
  languageText: {
    fontSize: 14,
    color: '#333',
  },
});

export default LanguageSelector; 