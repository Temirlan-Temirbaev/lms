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
  const [telephone, setTelephone] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !name || !telephone || !gender || !age) {
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

    if (password !== confirmPassword) {
      setErrorTitle(t('auth.error'));
      setErrorMessage(t('auth.passwordsDontMatch'));
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, telephone, gender, age);
    } catch (error) {
      let message = t('auth.registrationFailed');
      let title = t('auth.error');
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            message = error.response.data?.message || t('auth.invalidEmailFormat');
            break;
          case 409:
            message = t('auth.emailAlreadyExists');
            break;
          case 500:
            message = t('auth.serverError');
            break;
          default:
            message = error.response.data?.message || t('auth.registrationFailed');
        }
      }
      
      setErrorTitle(title);
      setErrorMessage(message);
      setShowError(true);
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
            placeholder={t('auth.telephone')}
            leftIcon={{ type: 'ionicon', name: 'call-outline' }}
            value={telephone}
            onChangeText={(text) => {
              // Only allow numbers
              const numericValue = text.replace(/[^0-9]/g, '');
              setTelephone(numericValue);
            }}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={15}
          />

          <Input
            placeholder={t('auth.age')}
            leftIcon={{ type: 'ionicon', name: 'calendar-outline' }}
            value={age}
            onChangeText={(text) => {
              // Only allow numbers
              const numericValue = text.replace(/[^0-9]/g, '');
              setAge(numericValue);
            }}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={3}
          />

          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>{t('auth.gender')}</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.selectedGender
                ]}
                onPress={() => setGender('male')}
              >
                <Text style={[
                  styles.genderButtonText,
                  gender === 'male' && styles.selectedGenderText
                ]}>{t('auth.male')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.selectedGender
                ]}
                onPress={() => setGender('female')}
              >
                <Text style={[
                  styles.genderButtonText,
                  gender === 'female' && styles.selectedGenderText
                ]}>{t('auth.female')}</Text>
              </TouchableOpacity>
            </View>
          </View>

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

      <CustomOverlay
        isVisible={showError}
        onClose={() => setShowError(false)}
        title={errorTitle}
        message={errorMessage}
        buttons={[
          {
            text: t('common.ok'),
            onPress: () => setShowError(false),
            style: { backgroundColor: colors.primary }
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
  genderContainer: {
    marginBottom: 20,
  },
  genderLabel: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 10,
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedGender: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderButtonText: {
    color: colors.darkGray,
  },
  selectedGenderText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default RegisterScreen; 