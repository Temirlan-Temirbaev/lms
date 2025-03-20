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

const RegisterScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      CustomOverlay({
        title: t('auth.error'),
        message: t('auth.fillAllFields'),
        platform: Platform.OS
      });
      return;
    }

    if (password !== confirmPassword) {
      CustomOverlay({
        title: t('auth.error'),
        message: t('auth.passwordsNotMatch'),
        platform: Platform.OS
      });
      return;
    }

    if (password.length < 6) {
      CustomOverlay({
        title: t('auth.error'),
        message: t('auth.passwordTooShort'),
        platform: Platform.OS
      });
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (error) {
      CustomOverlay({
        title: t('auth.registrationFailed'),
        message: t('auth.tryAgain'),
        platform: Platform.OS
      });
    } finally {
      setLoading(false);
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
          <Text style={styles.subHeaderText}>{t('auth.registerTitle')}</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            placeholder={t('auth.fullName')}
            leftIcon={{ type: 'ionicon', name: 'person-outline' }}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />

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

          <Input
            placeholder={t('auth.confirmPassword')}
            leftIcon={{ type: 'ionicon', name: 'lock-closed-outline' }}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            title={t('auth.register')}
            loading={loading}
            onPress={handleRegister}
            buttonStyle={styles.registerButton}
            containerStyle={styles.buttonContainer}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t('auth.hasAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{t('auth.signIn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: colors.darkGray,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen; 