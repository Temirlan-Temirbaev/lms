import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Keyboard, Platform } from 'react-native';
import { Overlay, Button, Icon } from '@rneui/themed';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const CustomOverlay = ({
  isVisible,
  onClose,
  title,
  message,
  buttons,
  scrollable = false,
  children
}) => {
  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={[
        styles.overlay,
        {
          margin: 0, // Add this to ensure full visibility
          width: width * 0.85,
          maxHeight: height * 0.8, // Limit height to 80% of screen
        }
      ]}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeButton}
          >
            <Icon name="close" type="ionicon" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Message */}
        {message && (
          <Text style={styles.message} numberOfLines={3}>{message}</Text>
        )}

        {/* Content */}
        {scrollable ? (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.content}>
            {children}
          </View>
        )}

        {/* Buttons */}
        {buttons && (
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <Button
                key={index}
                title={button.text}
                onPress={button.onPress}
                loading={button.loading}
                buttonStyle={[
                  styles.button,
                  button.type === 'cancel' && styles.cancelButton,
                  button.style,
                  buttons.length === 1 && styles.singleButton
                ]}
                titleStyle={[
                  styles.buttonText,
                  button.type === 'cancel' && styles.cancelButtonText,
                  button.titleStyle
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 0,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
    alignSelf: 'center',
    zIndex: 9999,
  },
  modalContent: {
    minHeight: 300, // Add this back
    backgroundColor: colors.white,
    borderRadius: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    minHeight: 60,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.black,
    paddingHorizontal: 40,
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 5,
    zIndex: 1,
    backgroundColor: colors.white,
  },
  message: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.white,
    minHeight: 40,
  },
  scrollView: {
    flex: 1,
    minHeight: 100,
    maxHeight: height * 0.4, // Add fixed maxHeight
    backgroundColor: 'white',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 20,
  },
  content: {
    padding: 15,
    backgroundColor: 'white',
    minHeight: 50, // Add minHeight back
    backgroundColor: 'white',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 20 : 15,
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    minHeight: 60,
    overflow: 'hidden',
  },
  button: {
    minWidth: (width * 0.85 - 70) / 2, // Changed from 0.9 to 0.85 to match overlay width
    borderRadius: 5,
    paddingVertical: 8,
    height: 40,
    backgroundColor: colors.primary,
  },
  singleButton: {
    minWidth: width * 0.85 - 30, // Changed from 0.9 to 0.85 to match overlay width
  },
  cancelButton: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: 16,
    color: colors.white,
  },
  cancelButtonText: {
    color: colors.darkGray,
  },
});

export default CustomOverlay;