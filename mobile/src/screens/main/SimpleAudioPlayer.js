import React, { useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity, View, StyleSheet, Alert } from "react-native";
import { Audio } from "expo-av";
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
  const [error, setError] = useState(null);

  // Load sound when component mounts
  const loadSound = async () => {
    try {
      // Unload any existing sound
      if (sound) {
        await sound.unloadAsync();
      }

      // Create new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false }
      );
      setSound(newSound);

      // Get duration
      const status = await newSound.getStatusAsync();
      setDuration(status.durationMillis / 1000);
    } catch (error) {
      console.error('Error loading sound:', error);
      setError('Failed to load audio');
    }
  };

  // Play sound
  const play = async () => {
    if (!sound) {
      await loadSound();
    }

    try {
      await sound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing sound:', error);
      setError('Failed to play audio');
    }
  };

  // Pause sound
  const pause = async () => {
    if (sound) {
      try {
        await sound.pauseAsync();
        setIsPlaying(false);
      } catch (error) {
        console.error('Error pausing sound:', error);
        setError('Failed to pause audio');
      }
    }
  };

  // Stop sound
  const stop = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        setIsPlaying(false);
        setCurrentTime(0);
      } catch (error) {
        console.error('Error stopping sound:', error);
        setError('Failed to stop audio');
      }
    }
  };

  // Update current time
  useEffect(() => {
    let interval;
    if (sound && isPlaying) {
      interval = setInterval(async () => {
        try {
          const status = await sound.getStatusAsync();
          setCurrentTime(status.positionMillis / 1000);
        } catch (error) {
          console.error('Error updating time:', error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sound, isPlaying]);

  // Load sound when URL changes
  useEffect(() => {
    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [url]);

  // Set up audio mode
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };
    setupAudio();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.stopButton]} 
            onPress={stop}
          >
            <Ionicons name="stop" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.playButton]} 
            onPress={() => isPlaying ? pause() : play()}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {
      width: 2,
      height: 2,
    },
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'mon-b',
    color: '#FF385C',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#FF385C',
  },
  stopButton: {
    backgroundColor: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
}); 