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
import { colors } from '../../theme/colors';
import CustomOverlay from '../../components/CustomOverlay';
import { forgotPassword, resetPassword } from '../../services/api';
import { useNavigation } from '@react-navigation/native';

const ResetPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayTitle, setOverlayTitle] = useState('');
  const [overlayMessage, setOverlayMessage] = useState('');

  const handleRequestReset = async () => {
    if (!email) {
      setOverlayTitle(t('auth.error'));
      setOverlayMessage(t('auth.fillAllFields'));
      setShowOverlay(true);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setOverlayTitle(t('auth.error'));
      setOverlayMessage(t('auth.invalidEmailFormat'));
      setShowOverlay(true);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setOverlayTitle(t('auth.success'));
      setOverlayMessage(t('auth.otpSent'));
      setShowOverlay(true);
      setStep('reset');
    } catch (error) {
      setOverlayTitle(t('auth.error'));
      setOverlayMessage(error.message || t('auth.resetEmailFailed'));
      setShowOverlay(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setOverlayTitle(t('auth.error'));
      setOverlayMessage(t('auth.fillAllFields'));
      setShowOverlay(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setOverlayTitle(t('auth.error'));
      setOverlayMessage(t('auth.passwordsDontMatch'));
      setShowOverlay(true);
      return;
    }

    if (newPassword.length < 6) {
      setOverlayTitle(t('auth.error'));
      setOverlayMessage(t('auth.passwordTooShort'));
      setShowOverlay(true);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, newPassword, otp);
      setOverlayTitle(t('auth.success'));
      setOverlayMessage(t('auth.passwordResetSuccess'));
      setShowOverlay(true);
      
      // Navigate to login after successful password reset
      setTimeout(() => {
        setShowOverlay(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 1500);
    } catch (error) {
      setOverlayTitle(t('auth.error'));
      setOverlayMessage(error.message || t('auth.passwordResetFailed'));
      setShowOverlay(true);
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
          <Text style={styles.headerText}>{t('auth.resetPassword')}</Text>
          <Text style={styles.subHeaderText}>
            {step === 'request' 
              ? t('auth.resetPasswordDesc')
              : t('auth.enterNewPassword')}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {step === 'request' ? (
            <Input
              placeholder={t('auth.email')}
              leftIcon={{ type: 'ionicon', name: 'mail-outline' }}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          ) : (
            <>
              <Input
                placeholder={t('auth.enterOtp')}
                leftIcon={{ type: 'ionicon', name: 'key-outline' }}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                placeholder={t('auth.newPassword')}
                leftIcon={{ type: 'ionicon', name: 'lock-closed-outline' }}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                placeholder={t('auth.confirmNewPassword')}
                leftIcon={{ type: 'ionicon', name: 'lock-closed-outline' }}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </>
          )}

          <Button
            title={step === 'request' ? t('auth.sendResetEmail') : t('auth.resetPassword')}
            loading={loading}
            onPress={step === 'request' ? handleRequestReset : handleResetPassword}
            buttonStyle={styles.resetButton}
            containerStyle={styles.buttonContainer}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t('auth.rememberPassword')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{t('auth.signIn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomOverlay
        isVisible={showOverlay}
        onClose={() => setShowOverlay(false)}
        title={overlayTitle}
        message={overlayMessage}
        buttons={[
          {
            text: t('common.ok'),
            onPress: () => setShowOverlay(false),
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
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  resetButton: {
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

export default ResetPasswordScreen; 