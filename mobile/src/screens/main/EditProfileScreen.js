import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Button, Avatar } from '@rneui/themed';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/api';
import { useTranslation } from 'react-i18next';
import { CustomOverlay } from '../../components/CustomOverlay';
import { colors } from '../../theme/colors';

const EditProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      CustomOverlay({
        title: t('common.error'),
        message: t('profile.nameRequired'),
        platform: Platform.OS
      });
      return;
    }

    setLoading(true);
    try {
      const userData = { name, email };
      await api.updateProfile(userData);
      await refreshUser();
      CustomOverlay({
        title: t('common.success'),
        message: t('profile.profileUpdated'),
        platform: Platform.OS,
        buttons: [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack()
          }
        ]
      });
    } catch (error) {
      CustomOverlay({
        title: t('common.error'),
        message: t('profile.updateFailed'),
        platform: Platform.OS
      });
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
            <Text style={styles.label}>{t('profile.name')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('profile.enterName')}
            />

            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('profile.enterEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={t('profile.save')}
          onPress={handleUpdateProfile}
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
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    backgroundColor: colors.lightGray,
  },
  changeAvatarButton: {
    marginTop: 10,
  },
  changeAvatarText: {
    color: colors.primary,
    fontSize: 16,
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: colors.black,
  },
  buttonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
  },
});

export default EditProfileScreen; 