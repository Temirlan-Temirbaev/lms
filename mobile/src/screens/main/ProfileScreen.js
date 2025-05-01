import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Avatar, Icon, Divider, Button } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import CustomOverlay from '../../components/CustomOverlay';
import { colors } from '../../theme/colors';
import { Modal } from 'react-native';  // Add this to imports
import * as api from '../../api/api';  // Add this import at the top

const ProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const [isLanguageVisible, setIsLanguageVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { refreshUser } = useAuth();
  
  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    setIsLogoutVisible(false);
  };

  const getLevelColor = (level) => {
    return colors.levels[level] || colors.primary;
  };

  const changeLanguage = async (lang) => {
    try {
      // Update language in i18n
      i18n.changeLanguage(lang);
      
      console.log("lang1")
      // Save to backend
      const res = await api.updateUserSettings({ language: lang });
      console.log("lang2")
      console.log(res)
      // Close overlay
      setIsLanguageVisible(false);
      refreshUser();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Add useEffect to set initial language
  useEffect(() => {
    if (user?.settings?.language) {
      i18n.changeLanguage(user.settings.language);
    }
  }, [user]);

  // Update the Language Selection Overlay
  // const renderLanguageOverlay = () => (
  //   <CustomOverlay
  //     isVisible={isLanguageVisible}
  //     onClose={() => setIsLanguageVisible(false)}
  //     title={t('language.select')}
  //     buttons={[
  //       {
  //         text: t('common.cancel'),
  //         onPress: () => setIsLanguageVisible(false),
  //         type: 'cancel'
  //       }
  //     ]}
  //   >
  //     <View style={styles.languageOptionsContainer}>
  //       <TouchableOpacity
  //         style={styles.languageOption}
  //         onPress={() => changeLanguage('kk')}
  //       >
  //         <Text style={[
  //           styles.languageText,
  //           i18n.language === 'kk' && styles.activeLanguage
  //         ]}>Қазақша</Text>
  //         {i18n.language === 'kk' && (
  //           <Icon name="checkmark" type="ionicon" color={colors.primary} size={20} />
  //         )}
  //       </TouchableOpacity>
  //       <TouchableOpacity
  //         style={styles.languageOption}
  //         onPress={() => changeLanguage('ru')}
  //       >
  //         <Text style={[
  //           styles.languageText,
  //           i18n.language === 'ru' && styles.activeLanguage
  //         ]}>Русский</Text>
  //         {i18n.language === 'ru' && (
  //           <Icon name="checkmark" type="ionicon" color={colors.primary} size={20} />
  //         )}
  //       </TouchableOpacity>
  //     </View>
  //   </CustomOverlay>
  // );

  // Add to styles
  const additionalStyles = {
    languageOptionsContainer: {
      backgroundColor: colors.white,
      borderRadius: 10,
      overflow: 'hidden',
      width: '100%',
    },
  };

  // Update the return statement to use the new render function
  return (
    <ScrollView style={styles.container}>
      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsLanguageVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsLanguageVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('language.select')}</Text>
            
            <TouchableOpacity
              style={styles.languageOption}
              onPress={() => changeLanguage('kk')}
            >
              <Text style={[styles.languageText, i18n.language === 'kk' && styles.activeLanguage]}>
                Қазақша
              </Text>
              {i18n.language === 'kk' && (
                <Icon name="checkmark" type="ionicon" color={colors.primary} size={20} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.languageOption}
              onPress={() => changeLanguage('ru')}
            >
              <Text style={[styles.languageText, i18n.language === 'ru' && styles.activeLanguage]}>
                Русский
              </Text>
              {i18n.language === 'ru' && (
                <Icon name="checkmark" type="ionicon" color={colors.primary} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Logout Overlay */}
      <CustomOverlay
        isVisible={isLogoutVisible}
        onClose={() => setIsLogoutVisible(false)}
        title={t('profile.logoutConfirm')}
        message={t('profile.logoutMessage')}
        buttons={[
          {
            text: t('profile.cancel'),
            onPress: () => setIsLogoutVisible(false),
            type: 'cancel'
          },
          {
            text: t('profile.logout'),
            onPress: handleLogout,
            loading: loading,
            style: { backgroundColor: colors.error }
          }
        ]}
      />

      {/* Language Selection Overlay */}
      {/* <CustomOverlay
        isVisible={isLanguageVisible}
        onClose={() => setIsLanguageVisible(false)}
        title={t('language.select')}
        buttons={[
          {
            text: t('common.cancel'),
            onPress: () => setIsLanguageVisible(false),
            type: 'cancel'
          }
        ]}
      >
        <TouchableOpacity
          style={styles.languageOption}
          onPress={() => changeLanguage('kk')}
        >
          <Text style={[
            styles.languageText,
            i18n.language === 'kk' && styles.activeLanguage
          ]}>Қазақша</Text>
          {i18n.language === 'kk' && (
            <Icon name="checkmark" type="ionicon" color={colors.primary} size={20} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.languageOption}
          onPress={() => changeLanguage('ru')}
        >
          <Text style={[
            styles.languageText,
            i18n.language === 'ru' && styles.activeLanguage
          ]}>Русский</Text>
          {i18n.language === 'ru' && (
            <Icon name="checkmark" type="ionicon" color={colors.primary} size={20} />
          )}
        </TouchableOpacity>
      </CustomOverlay> */}

      {/* User Info Section */}
      <View style={styles.userInfoSection}>
        <Avatar
          size={100}
          rounded
          title={user?.name?.charAt(0) || 'U'}
          containerStyle={styles.avatar}
          source={user?.avatar ? { uri: user.avatar } : null}
        />
        <Text style={styles.userName}>{user?.name || t('profile.user')}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.levelContainer}>
          <Text style={[
            styles.levelText, 
            { backgroundColor: getLevelColor(user?.progress?.currentLevel || 'A1') }
          ]}>
            {user?.progress?.currentLevel || 'A1'}
          </Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>{t('profile.learningStats')}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.progress?.completedLessons?.length || 0}</Text>
            <Text style={styles.statLabel}>{t('profile.lessons')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.progress?.completedTests?.length || 0}</Text>
            <Text style={styles.statLabel}>{t('profile.tests')}</Text>
          </View>
          {/* <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t('profile.dayStreak')}</Text>
          </View> */}
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* Options Section */}
      <View style={styles.optionsSection}>
        <Text style={styles.sectionTitle}>{t('profile.accountSettings')}</Text>
        
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Icon
            name="person-outline"
            type="ionicon"
            color={colors.primary}
            size={24}
            containerStyle={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{t('profile.editProfile')}</Text>
            <Text style={styles.optionDescription}>{t('profile.editProfileDesc')}</Text>
          </View>
          <Icon
            name="chevron-forward"
            type="ionicon"
            color={colors.border}
            size={20}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Icon
            name="lock-closed-outline"
            type="ionicon"
            color={colors.primary}
            size={24}
            containerStyle={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{t('profile.changePassword')}</Text>
            <Text style={styles.optionDescription}>{t('profile.changePasswordDesc')}</Text>
          </View>
          <Icon
            name="chevron-forward"
            type="ionicon"
            color={colors.border}
            size={20}
          />
        </TouchableOpacity>
        
        {/* <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => navigation.navigate('Progress')}
        >
          <Icon
            name="bar-chart-outline"
            type="ionicon"
            color={colors.primary}
            size={24}
            containerStyle={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{t('profile.viewProgress')}</Text>
            <Text style={styles.optionDescription}>{t('profile.viewProgressDesc')}</Text>
          </View>
          <Icon
            name="chevron-forward"
            type="ionicon"
            color={colors.border}
            size={20}
          />
        </TouchableOpacity> */}

        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => setIsLanguageVisible(true)}
        >
          <Icon
            name="language"
            type="ionicon"
            color={colors.primary}
            size={24}
            containerStyle={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{t('language.change')}</Text>
            <Text style={styles.optionDescription}>{t('language.changeDesc')}</Text>
          </View>
          <Icon
            name="chevron-forward"
            type="ionicon"
            color={colors.border}
            size={20}
          />
        </TouchableOpacity>
      </View>

      <Divider style={styles.divider} />

      {/* Logout Button */}
      <Button
        title={t('profile.logout')}
        icon={{
          name: 'log-out-outline',
          type: 'ionicon',
          color: '#fff',
          size: 20,
        }}
        buttonStyle={styles.logoutButton}
        containerStyle={styles.logoutButtonContainer}
        onPress={() => setIsLogoutVisible(true)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  userInfoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.background,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    color: colors.black,
  },
  userEmail: {
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 5,
  },
  levelContainer: {
    marginTop: 15,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  divider: {
    marginVertical: 15,
    backgroundColor: colors.border,
  },
  statsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 5,
  },
  optionsSection: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionIcon: {
    marginRight: 15,
    backgroundColor: colors.lightGray,
    padding: 10,
    borderRadius: 10,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 3,
  },
  logoutButtonContainer: {
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingVertical: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  languageText: {
    fontSize: 16,
    color: colors.black,
  },
  activeLanguage: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.black,
  },
});

export default ProfileScreen;
