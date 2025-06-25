import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const ImageOverlay = ({ isVisible, imageUrl, onClose }) => {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      // Reset scale and position when closing
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
    }
  }, [isVisible]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      setTranslateX(gestureState.dx);
      setTranslateY(gestureState.dy);
    },
    onPanResponderRelease: () => {
      setTranslateX(0);
      setTranslateY(0);
    },
  });

  const handleZoomIn = () => {
    setScale(scale + 0.5);
  };

  const handleZoomOut = () => {
    if (scale > 1) {
      setScale(scale - 0.5);
    }
  };

  if (!isVisible || !imageUrl) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close" type="ionicon" size={30} color={colors.white} />
        </TouchableOpacity>
        
        <View style={styles.zoomControls}>
          <TouchableOpacity 
            onPress={handleZoomIn} 
            style={styles.zoomButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="add" type="ionicon" size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleZoomOut} 
            style={styles.zoomButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="remove" type="ionicon" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [
                { scale },
                { translateX },
                { translateY },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    flexDirection: 'row',
    zIndex: 1,
  },
  zoomButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  imageContainer: {
    width: width,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ImageOverlay; 