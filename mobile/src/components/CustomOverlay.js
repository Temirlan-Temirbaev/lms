import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Overlay, Button, Icon } from '@rneui/themed';

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
      overlayStyle={styles.overlay}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
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
          <Text style={styles.message}>{message}</Text>
        )}

        {/* Content */}
        {scrollable ? (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
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
    width: width * 0.85,
    minHeight: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
    alignSelf: 'center',
  },
  modalContent: {
    minHeight: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    minHeight: 70,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 40,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 12,
    padding: 5,
    zIndex: 1,
    backgroundColor: 'white',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    minHeight: 50,
  },
  scrollView: {
    minHeight: 100,
    maxHeight: height * 0.4,
    backgroundColor: 'white',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 20,
  },
  content: {
    padding: 15,
    backgroundColor: 'white',
    minHeight: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingBottom: 20,
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    minHeight: 70,
    overflow: 'hidden',
  },
  button: {
    minWidth: (width * 0.85 - 70) / 2,
    borderRadius: 5,
    paddingVertical: 10,
    height: 40,
  },
  singleButton: {
    minWidth: width * 0.85 - 30,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
  cancelButtonText: {
    color: '#666',
  },
});

export default CustomOverlay; 