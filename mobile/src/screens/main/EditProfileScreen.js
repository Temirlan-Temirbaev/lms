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
} from 'react-native';
import { Button, Avatar } from '@rneui/themed';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/api';
import { useTranslation } from 'react-i18next';

const EditProfileScreen = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('profile.nameRequired'));
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name,
        email,
      };

      await api.updateProfile(userData);
      await refreshUser();
      Alert.alert(t('common.success'), t('profile.profileUpdated'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.updateFailed'));
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
          title={t('common.save')}
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
    backgroundColor: '#fff',
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
    backgroundColor: '#e0e0e0',
  },
  changeAvatarButton: {
    marginTop: 10,
  },
  changeAvatarText: {
    color: '#4F8EF7',
    fontSize: 16,
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

export default EditProfileScreen; 