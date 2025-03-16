import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Avatar, Icon, Divider, Button } from '@rneui/themed';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            setLoading(true);
            await logout();
            setLoading(false);
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const getLevelColor = (level) => {
    const levels = {
      'A1': '#4CAF50',
      'A2': '#8BC34A',
      'B1': '#FFC107',
      'B2': '#FF9800',
    };
    return levels[level] || '#4F8EF7';
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info Section */}
      <View style={styles.userInfoSection}>
        <Avatar
          size={100}
          rounded
          title={user?.name?.charAt(0) || 'U'}
          containerStyle={styles.avatar}
          source={user?.avatar ? { uri: user.avatar } : null}
        />
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
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
        <Text style={styles.sectionTitle}>Learning Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.progress?.completedLessons?.length || 0}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.progress?.completedTests?.length || 0}</Text>
            <Text style={styles.statLabel}>Tests</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* Options Section */}
      <View style={styles.optionsSection}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Icon
            name="person-outline"
            type="ionicon"
            color="#4F8EF7"
            size={24}
            containerStyle={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Edit Profile</Text>
            <Text style={styles.optionDescription}>Update your personal information</Text>
          </View>
          <Icon
            name="chevron-forward"
            type="ionicon"
            color="#ccc"
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
            color="#4F8EF7"
            size={24}
            containerStyle={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Change Password</Text>
            <Text style={styles.optionDescription}>Update your password</Text>
          </View>
          <Icon
            name="chevron-forward"
            type="ionicon"
            color="#ccc"
            size={20}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => navigation.navigate('Progress')}
        >
          <Icon
            name="bar-chart-outline"
            type="ionicon"
            color="#4F8EF7"
            size={24}
            containerStyle={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>View Progress</Text>
            <Text style={styles.optionDescription}>Track your learning journey</Text>
          </View>
          <Icon
            name="chevron-forward"
            type="ionicon"
            color="#ccc"
            size={20}
          />
        </TouchableOpacity>
      </View>

      <Divider style={styles.divider} />

      {/* Logout Button */}
      <Button
        title="Logout"
        icon={{
          name: 'log-out-outline',
          type: 'ionicon',
          color: '#fff',
          size: 20,
        }}
        buttonStyle={styles.logoutButton}
        containerStyle={styles.logoutButtonContainer}
        loading={loading}
        onPress={handleLogout}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  userInfoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f9f9f9',
  },
  avatar: {
    backgroundColor: '#4F8EF7',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
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
  },
  statsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#4F8EF7',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
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
    borderBottomColor: '#f0f0f0',
  },
  optionIcon: {
    marginRight: 15,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  logoutButtonContainer: {
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    paddingVertical: 12,
  },
});

export default ProfileScreen; 