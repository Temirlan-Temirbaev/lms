import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Button } from '@rneui/themed';
import * as api from '../../api/api';
import { useTranslation } from 'react-i18next';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('profile.fillAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await api.changePassword({
        currentPassword,
        newPassword,
      });
      
      Alert.alert(t('common.success'), t('profile.passwordChanged'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.passwordChangeFailed'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>{t('profile.currentPassword')}</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t('profile.enterCurrentPassword')}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>{t('profile.newPassword')}</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('profile.enterNewPassword')}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>{t('profile.confirmNewPassword')}</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('profile.confirmNewPasswordPlaceholder')}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={t('common.save')}
          onPress={handleChangePassword}
          loading={loading}
          buttonStyle={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 25,
    height: 50,
  },
});

export default ChangePasswordScreen; 