import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Input, Button } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import CustomOverlay from '../../components/CustomOverlay';

const DeleteAccountScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { deleteAccount } = useAuth();

  const handleDeleteRequest = () => {
    if (!password) {
      setErrorMessage(t('profile.enterPasswordToDelete'));
      setShowError(true);
      return;
    }
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setShowConfirm(false);
    
    try {
      await deleteAccount(password);
      // Account deletion successful - user will be automatically logged out
      // and redirected to login screen by the auth context
    } catch (error) {
      setErrorMessage(error.message || t('profile.deleteAccountFailed'));
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Warning Section */}
      <View style={styles.warningContainer}>
        <Text style={styles.warningTitle}>⚠️ {t('profile.deleteAccountConfirm')}</Text>
        <Text style={styles.warningText}>
          {t('profile.deleteAccountMessage')}
        </Text>
      </View>

      {/* Password Input */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>{t('profile.deleteAccountPassword')}</Text>
        <Input
          placeholder={t('profile.enterPasswordToDelete')}
          leftIcon={{ type: 'ionicon', name: 'lock-closed-outline' }}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Delete Button */}
      <Button
        title={t('profile.confirmDelete')}
        loading={loading}
        onPress={handleDeleteRequest}
        buttonStyle={styles.deleteButton}
        containerStyle={styles.buttonContainer}
        disabled={!password}
      />

      {/* Confirmation Overlay */}
      <CustomOverlay
        isVisible={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={t('profile.deleteAccountConfirm')}
        message={t('profile.deleteAccountMessage')}
        buttons={[
          {
            text: t('common.cancel'),
            onPress: () => setShowConfirm(false),
            type: 'cancel'
          },
          {
            text: t('profile.confirmDelete'),
            onPress: handleDeleteConfirm,
            loading: loading,
            style: { backgroundColor: colors.error }
          }
        ]}
      />

      {/* Error Overlay */}
      <CustomOverlay
        isVisible={showError}
        onClose={() => setShowError(false)}
        title={t('common.error')}
        message={errorMessage}
        buttons={[
          {
            text: t('common.ok'),
            onPress: () => setShowError(false)
          }
        ]}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    padding: 20,
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  warningText: {
    fontSize: 16,
    color: '#856404',
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingVertical: 12,
  },
});

export default DeleteAccountScreen; 