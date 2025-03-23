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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const getOverlayHeight = () => {
    const baseHeight = height * 0.8;
    const maxHeight = height - 40;
    const minHeight = Math.min(300, height * 0.4);
    
    if (keyboardHeight > 0) {
      return Math.min(baseHeight, maxHeight - keyboardHeight);
    }
    
    return Math.max(minHeight, Math.min(baseHeight, maxHeight));
  };

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={[
        styles.overlay,
        {
          width: width * 0.9,
          maxHeight: getOverlayHeight(),
          marginTop: Platform.OS === 'ios' ? 20 : 0,
        }
      ]}
    >
      <View style={[styles.modalContent, { maxHeight: getOverlayHeight() }]}>
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
  },
  modalContent: {
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
    backgroundColor: 'white',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 20,
  },
  content: {
    padding: 15,
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
    minWidth: (width * 0.9 - 70) / 2,
    borderRadius: 5,
    paddingVertical: 8,
    height: 40,
    backgroundColor: colors.primary,
  },
  singleButton: {
    minWidth: width * 0.9 - 30,
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