import React, { useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

// Function to convert time to MM:SS format
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export const SimpleAudioPlayer = ({ url }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Load sound when component mounts
  const loadSound = async () => {
    try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: false }
    );
    setSound(sound);

    // Get audio duration
    const status = await sound.getStatusAsync();
    setDuration(status.durationMillis / 1000); // in seconds
  } catch (error) {
    console.error('Error loading sound:', error);
  }
  };

  // Play sound
  const play = async () => {
    if (sound) {
      try {
        await sound.playAsync();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  };

  // Pause
  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  // Get current audio time
  const updateTime = async () => {
    if (sound && !isSeeking) {
      const status = await sound.getStatusAsync();
      setCurrentTime(status.positionMillis / 1000); // in seconds
    }
  };

  // Handle slider position change
  const seekAudio = async (value) => {
    if (sound) {
      setCurrentTime(value);
      await sound.setPositionAsync(value * 1000); // convert to milliseconds
    }
  };

  const setAudioMode = async () => {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true, // Enables sound even in silent mode
    });
  };

  // Update current time every second
  useEffect(() => {
    setAudioMode();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval); // clear interval on unmount
  }, [sound]);

  // Load sound when component mounts
  useEffect(() => {
    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [url]);

  // Stop music when leaving screen
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (sound) {
          sound.stopAsync(); // Stop sound
          setIsPlaying(false); // Update button state
        }
      };
    }, [sound])
  );

  return (
    <>
      {Platform.OS === "web" ? (
        <audio style={{ marginBottom: "15px" }} src={url} controls={true}>
        </audio>
      ) : (
        <>
          <View style={{ paddingTop: 20, paddingRight: 32, display: "flex", alignItems: "center", flexDirection: "row" }}>
            <TouchableOpacity onPress={() => (isPlaying ? pause() : play())}>
              <Text style={{ fontSize: 20, marginBottom: 10 }}>
                {isPlaying ? <Ionicons name="pause" size={32} color="#6c38cc" /> : <Ionicons size={32} color="#6c38cc" name="play" />}
              </Text>
            </TouchableOpacity>

            <Slider
              style={{ width: "100%", marginBottom: 10 }}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onSlidingStart={() => setIsSeeking(true)}
              onSlidingComplete={(value) => {
                setIsSeeking(false);
                seekAudio(value);
              }}
              minimumTrackTintColor="#6c38cc"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#6c38cc"
            />
          </View>
          
          <View style={{ marginBottom: 10, paddingLeft: 5 }}>
            <Text>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </View>
        </>
      )}
    </>
  );
};