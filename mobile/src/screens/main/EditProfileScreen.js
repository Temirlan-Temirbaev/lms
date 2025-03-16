import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Input, Button } from '@rneui/themed';
import { useAuth } from '../../context/AuthContext';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name, email });
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
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
            label="Name"
            placeholder="Enter your name"
            leftIcon={{ type: 'ionicon', name: 'person-outline' }}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            labelStyle={styles.inputLabel}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            leftIcon={{ type: 'ionicon', name: 'mail-outline' }}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            labelStyle={styles.inputLabel}
          />

          <Button
            title="Update Profile"
            loading={loading}
            onPress={handleUpdateProfile}
            buttonStyle={styles.updateButton}
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
  updateButton: {
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

export default EditProfileScreen; 