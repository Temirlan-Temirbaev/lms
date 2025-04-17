import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Icon } from '@rneui/themed';
import { colors } from '../theme/colors';

const RefreshButton = ({ onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon
        name="refresh"
        type="ionicon"
        size={24}
        color={colors.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    right: 10,
    padding: 10,
    zIndex: 1000,
    backgroundColor: colors.white,
    borderRadius: 20,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default RefreshButton; 