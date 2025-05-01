import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Input, Button } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import CustomOverlay from '../../components/CustomOverlay';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setErrorTitle(t('auth.error'));
        setErrorMessage(t('auth.fillAllFields'));
        setShowError(true);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorTitle(t('auth.error'));
        setErrorMessage(t('auth.invalidEmailFormat'));
        setShowError(true);
        return;
      }

      const response = await login(email, password);
      if (response.token) {
        await AsyncStorage.setItem('userToken', response.token);
        navigation.replace('Main');
      }
    } catch (error) {
      let errorMessage = t('auth.serverError');
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = t('auth.invalidCredentials');
            break;
          case 500:
            errorMessage = t('auth.serverError');
            break;
          default:
            errorMessage = t('auth.serverError');
        }
      }

      setErrorTitle(t('auth.error'));
      setErrorMessage(errorMessage);
      setShowError(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{t('auth.appName')}</Text>
          <Text style={styles.subHeaderText}>{t('auth.loginTitle')}</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            placeholder={t('auth.email')}
            leftIcon={{ type: 'ionicon', name: 'mail-outline' }}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Input
            placeholder={t('auth.password')}
            leftIcon={{ type: 'ionicon', name: 'lock-closed-outline' }}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ResetPassword')}
          >
            <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>

          <Button
            title={t('auth.login')}
            loading={loading}
            onPress={handleLogin}
            buttonStyle={styles.loginButton}
            containerStyle={styles.buttonContainer}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>{t('auth.noAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>{t('auth.signUp')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomOverlay
        isVisible={showError}
        onClose={() => setShowError(false)}
        title={errorTitle}
        message={errorMessage}
        buttons={[
          {
            text: t('common.ok'),
            onPress: () => setShowError(false),
          }
        ]}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: colors.darkGray,
  },
  formContainer: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: colors.darkGray,
  },
  registerLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
});

export default LoginScreen; 