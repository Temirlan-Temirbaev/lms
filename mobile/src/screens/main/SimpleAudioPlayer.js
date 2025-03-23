import React, { useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export const SimpleAudioPlayer = ({ audio }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!audio) return;
    
    const initAudio = async () => {
      try {
        // Set audio mode
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        // Create sound object
        const soundObject = new Audio.Sound();
        
        // Load audio
        const source = typeof audio === 'string' ? { uri: audio } : audio;
        await soundObject.loadAsync(source);
        
        // Get status
        const status = await soundObject.getStatusAsync();
        
        // Set duration based on platform
        const durationInMs = Platform.OS === 'web' 
          ? status.durationMillis * 1000 
          : status.durationMillis;

        setSound(soundObject);
        setDuration(durationInMs);
        setError(null);

      } catch (err) {
        console.error('Init audio error:', err);
        setError('Failed to initialize audio');
      }
    };

    initAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audio]);

  // Update time tracking
  useEffect(() => {
    if (!sound || !isPlaying) return;

    const interval = setInterval(async () => {
      if (!isSeeking) {
        try {
          const status = await sound.getStatusAsync();
          const currentTimeMs = Platform.OS === 'web'
            ? status.positionMillis * 1000
            : status.positionMillis;
          setCurrentTime(currentTimeMs);
        } catch (error) {
          console.error('Error updating time:', error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sound, isPlaying, isSeeking]);

  const play = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const seekAudio = async (value) => {
    if (sound) {
      setCurrentTime(value);
      await sound.setPositionAsync(value * 1000);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (sound) {
          sound.stopAsync();
          setIsPlaying(false);
        }
      };
    }, [sound])
  );

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <audio
          controls
          src={audio}
          style={{
            width: '100%',
            height: 40,
            borderRadius: 20,
            marginBottom: 15
          }}
        >
          Your browser does not support the audio element.
        </audio>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        <TouchableOpacity onPress={() => (isPlaying ? pause() : play())}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={32} 
            color="#6c38cc" 
          />
        </TouchableOpacity>

        <Slider
          style={styles.slider}
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
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
  },
  playerContainer: {
    paddingTop: 20,
    paddingRight: 32,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
  },
  slider: {
    width: "100%",
    marginBottom: 10,
  },
  timeContainer: {
    marginBottom: 10,
    paddingLeft: 5,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginVertical: 5,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  }
});