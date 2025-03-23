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
import * as api from '../../services/api';
import { useTranslation } from 'react-i18next';
import CustomOverlay from '../../components/CustomOverlay';
import { colors } from '../../theme/colors';

const EditProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayConfig, setOverlayConfig] = useState({
    title: '',
    message: '',
    buttons: []
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setTelephone(user.telephone || '');
      setGender(user.gender || '');
      setAge(user.age?.toString() || '');
    }
  }, [user]);

  const showOverlay = (title, message, buttons = []) => {
    setOverlayConfig({ title, message, buttons });
    setOverlayVisible(true);
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      showOverlay(t('common.error'), t('profile.nameRequired'));
      return;
    }

    if (!telephone.trim()) {
      showOverlay(t('common.error'), t('profile.telephoneRequired'));
      return;
    }

    if (!gender) {
      showOverlay(t('common.error'), t('profile.genderRequired'));
      return;
    }

    if (!age || isNaN(age) || parseInt(age) < 1 || parseInt(age) > 120) {
      showOverlay(t('common.error'), t('profile.invalidAge'));
      return;
    }

    setLoading(true);
    try {
      const userData = { 
        name, 
        email, 
        telephone, 
        gender, 
        age: parseInt(age)
      };
      await api.updateUserDetails(userData);
      await refreshUser();
      showOverlay(
        t('common.success'),
        t('profile.profileUpdated'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      showOverlay(t('common.error'), t('profile.updateFailed'));
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

            <Text style={styles.label}>{t('auth.telephone')}</Text>
            <TextInput
              style={styles.input}
              value={telephone}
              onChangeText={(text) => {
                // Only allow numbers
                const numericValue = text.replace(/[^0-9]/g, '');
                setTelephone(numericValue);
              }}
              placeholder={t('profile.enterTelephone')}
              keyboardType="phone-pad"
              autoCapitalize="none"
              maxLength={15}
            />

            <Text style={styles.label}>{t('auth.age')}</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={(text) => {
                // Only allow numbers
                const numericValue = text.replace(/[^0-9]/g, '');
                setAge(numericValue);
              }}
              placeholder={t('profile.enterAge')}
              keyboardType="number-pad"
              autoCapitalize="none"
              maxLength={3}
            />

            <Text style={styles.label}>{t('auth.gender')}</Text>
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

      <CustomOverlay
        isVisible={overlayVisible}
        onClose={() => setOverlayVisible(false)}
        title={overlayConfig.title}
        message={overlayConfig.message}
        buttons={overlayConfig.buttons}
      />
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
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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

export default EditProfileScreen; 