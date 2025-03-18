import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { Icon } from '@rneui/themed';

export const AudioPlayer = ({ audioUrl }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  async function loadSound() {
    if (sound) {
      return;
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: false }
    );
    setSound(newSound);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setPosition(status.positionMillis);
        setDuration(status.durationMillis || 1);
        setIsPlaying(status.isPlaying);
      }
    });
  }

  async function playPauseSound() {
    if (!sound) {
      await loadSound();
    }
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    setIsPlaying(!isPlaying);
  }

  async function seekSound(value) {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  }

  return (
    <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon
          name={isPlaying ? 'pause-circle' : 'play-circle'}
          type="ionicon"
          color="#4F8EF7"
          size={32}
          onPress={playPauseSound}
        />
        <Text style={{ marginLeft: 10, color: '#333' }}>{audioUrl.split('/').pop()}</Text>
      </View>
      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onValueChange={seekSound}
      />
      <Text>{Math.floor(position / 1000)}s / {Math.floor(duration / 1000)}s</Text>
    </View>
  );
};

export default AudioPlayer;