import React from 'react';
import { Text } from 'react-native';

export const DigitalTimeString = ({ time }) => {
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Text style={{ fontSize: 12, color: '#666' }}>
      {formatTime(time)}
    </Text>
  );
};

export default DigitalTimeString; 