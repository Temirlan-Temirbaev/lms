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
import { verifyOtp, resetPassword } from '../../services/api';
import { useRoute, useNavigation } from '@react-navigation/native';

const OtpVerificationScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('verify'); // 'verify' or 'reset'
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayTitle, setOverlayTitle] = useState('');
  const [overlayMessage, setOverlayMessage] = useState('');

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOverlayTitle(t('auth.error'));
      setOverlayMessage(t('auth.enterOtp'));
      setShowOverlay(true);
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(route.params.email, otp);
      console.log(response, "response");
      setStep('reset');
    } catch (error) {
      setOverlayTitle(t('auth.error'));
      setOverlayMessage(error.message || t('auth.otpInvalid'));
      setShowOverlay(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
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
      await resetPassword(route.params.email, newPassword, otp);
      setOverlayTitle(t('auth.success'));
      setOverlayMessage(t('auth.passwordResetSuccess'));
      setShowOverlay(true);
      
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
          <Text style={styles.headerText}>
            {step === 'verify' ? t('auth.verifyOtp') : t('auth.resetPassword')}
          </Text>
          <Text style={styles.subHeaderText}>
            {step === 'verify'
              ? t('auth.otpSent')
              : t('auth.enterNewPassword')}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {step === 'verify' ? (
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
          ) : (
            <>
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
            title={
              step === 'verify'
                ? t('auth.verifyOtp')
                : t('auth.resetPassword')
            }
            loading={loading}
            onPress={step === 'verify' ? handleVerifyOtp : handleResetPassword}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
          />

          {step === 'verify' && (
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>{t('auth.didntReceiveOtp')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
                <Text style={styles.resendLink}>{t('auth.resendOtp')}</Text>
              </TouchableOpacity>
            </View>
          )}
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendText: {
    color: colors.darkGray,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default OtpVerificationScreen; 