import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Input, Button } from '@rneui/themed';
import { useAuth } from '../../context/AuthContext';

const ChangePasswordScreen = ({ navigation }) => {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState({
    current: true,
    new: true,
    confirm: true,
  });

  const toggleSecureEntry = (field) => {
    setSecureTextEntry({
      ...secureTextEntry,
      [field]: !secureTextEntry[field],
    });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to change password');
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
        <View style={styles.formContainer}>
          <Input
            label="Current Password"
            placeholder="Enter your current password"
            leftIcon={{ type: 'ionicon', name: 'lock-closed-outline' }}
            rightIcon={{
              type: 'ionicon',
              name: secureTextEntry.current ? 'eye-outline' : 'eye-off-outline',
              onPress: () => toggleSecureEntry('current'),
            }}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={secureTextEntry.current}
            autoCapitalize="none"
            autoCorrect={false}
            labelStyle={styles.inputLabel}
          />

          <Input
            label="New Password"
            placeholder="Enter your new password"
            leftIcon={{ type: 'ionicon', name: 'lock-closed-outline' }}
            rightIcon={{
              type: 'ionicon',
              name: secureTextEntry.new ? 'eye-outline' : 'eye-off-outline',
              onPress: () => toggleSecureEntry('new'),
            }}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={secureTextEntry.new}
            autoCapitalize="none"
            autoCorrect={false}
            labelStyle={styles.inputLabel}
          />

          <Input
            label="Confirm New Password"
            placeholder="Confirm your new password"
            leftIcon={{ type: 'ionicon', name: 'lock-closed-outline' }}
            rightIcon={{
              type: 'ionicon',
              name: secureTextEntry.confirm ? 'eye-outline' : 'eye-off-outline',
              onPress: () => toggleSecureEntry('confirm'),
            }}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={secureTextEntry.confirm}
            autoCapitalize="none"
            autoCorrect={false}
            labelStyle={styles.inputLabel}
          />

          <Button
            title="Change Password"
            loading={loading}
            onPress={handleChangePassword}
            buttonStyle={styles.changeButton}
            containerStyle={styles.buttonContainer}
          />

          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            buttonStyle={styles.cancelButton}
            containerStyle={styles.buttonContainer}
            type="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    color: '#333',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  changeButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 25,
    height: 50,
  },
  cancelButton: {
    borderColor: '#9E9E9E',
    borderWidth: 1,
    borderRadius: 25,
    height: 50,
  },
});

export default ChangePasswordScreen; 