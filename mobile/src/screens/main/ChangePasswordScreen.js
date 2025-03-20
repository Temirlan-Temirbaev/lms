import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Button, Icon } from '@rneui/themed';
import * as api from '../../api/api';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const renderPasswordInput = (
    value,
    setValue,
    label,
    placeholder,
    showPassword,
    setShowPassword
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Icon
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            type="ionicon"
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            {renderPasswordInput(
              currentPassword,
              setCurrentPassword,
              t('profile.currentPassword'),
              t('profile.enterCurrentPassword'),
              showCurrentPassword,
              setShowCurrentPassword
            )}

            {renderPasswordInput(
              newPassword,
              setNewPassword,
              t('profile.newPassword'),
              t('profile.enterNewPassword'),
              showNewPassword,
              setShowNewPassword
            )}

            {renderPasswordInput(
              confirmPassword,
              setConfirmPassword,
              t('profile.confirmNewPassword'),
              t('profile.confirmNewPasswordPlaceholder'),
              showConfirmPassword,
              setShowConfirmPassword
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={t('common.save')}
          onPress={handleChangePassword}
          loading={loading}
          buttonStyle={styles.saveButton}
          titleStyle={styles.buttonTitle}
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.black,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.black,
  },
  eyeIcon: {
    padding: 10,
    color: colors.darkGray,
  },
  buttonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 50,
    marginHorizontal: 8,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen; 