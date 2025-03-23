import React, { PureComponent } from "react";
import {
    TouchableOpacity,
    Animated,
    PanResponder,
    View,
    Easing,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Text,
    Platform
} from "react-native";
import { Audio } from 'expo-av';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import sleep from './sleep';
import DigitalTimeString from './DigitalTimeString';
import { colors } from '../../theme/colors';

const TRACK_SIZE = 4;
const THUMB_SIZE = 20;

export class AudioSlider extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            playing: false,
            currentTime: 0,
            duration: 0,
            trackLayout: {},
            dotOffset: new Animated.ValueXY(),
            xDotOffsetAtAnimationStart: 0,
            isLoading: true,
            error: null
        }

        this._panResponder = PanResponder.create({
            onMoveShouldSetResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderGrant: async (e, gestureState) => {
                if (this.state.playing) {
                    await this.pause();
                }
                await this.setState({xDotOffsetAtAnimationStart: this.state.dotOffset.x._value});
                await this.state.dotOffset.setOffset({x: this.state.dotOffset.x._value});
                await this.state.dotOffset.setValue({ x:0, y:0 });
            },
            onPanResponderMove: (e, gestureState) => {
                Animated.event(
                    [
                        null, 
                        { dx: this.state.dotOffset.x, dy: this.state.dotOffset.y }
                    ],
                    { useNativeDriver: false }
                )(e, gestureState)
            },
            onPanResponderTerminationRequest: () => false,
            onPanResponderTerminate: async (evt, gestureState) => {
                const currentOffsetX = this.state.xDotOffsetAtAnimationStart + this.state.dotOffset.x._value;
                if (currentOffsetX < 0 || currentOffsetX > this.state.trackLayout.width) {
                    await this.state.dotOffset.setValue({ x:-this.state.xDotOffsetAtAnimationStart, y:0 });
                }
                await this.state.dotOffset.flattenOffset();
                await this.mapAudioToCurrentTime()
            },
            onPanResponderRelease: async (e, {vx}) => {
                const currentOffsetX = this.state.xDotOffsetAtAnimationStart + this.state.dotOffset.x._value;
                if (currentOffsetX < 0 || currentOffsetX > this.state.trackLayout.width) {
                    await this.state.dotOffset.setValue({ x:-this.state.xDotOffsetAtAnimationStart, y:0 });
                }
                await this.state.dotOffset.flattenOffset();
                await this.mapAudioToCurrentTime()
            }
        });
    }

    mapAudioToCurrentTime = async () => {
        try {
            const currentOffsetX = this.state.xDotOffsetAtAnimationStart + this.state.dotOffset.x._value;
            const percentage = Math.min(Math.max(currentOffsetX / (this.state.trackLayout.width || 1), 0), 1);
            
            if (Platform.OS === 'web') {
                // For web: work with seconds and ensure the value is finite
                const durationInSeconds = this.state.duration / 1000;
                const newTimeInSeconds = Math.floor(percentage * durationInSeconds);
                const validTime = Math.max(0, Math.min(newTimeInSeconds, durationInSeconds));
                
                if (isFinite(validTime)) {
                    await this.soundObject.setPositionAsync(validTime);
                    this.setState({ currentTime: validTime * 1000 }); // Convert back to milliseconds for state
                }
            } else {
                // For mobile: work with milliseconds
                const newTime = Math.floor(percentage * this.state.duration);
                const validTime = Math.max(0, Math.min(newTime, this.state.duration));
                
                await this.soundObject.setPositionAsync(validTime);
                this.setState({ currentTime: validTime });
            }
        } catch (error) {
            console.error('Error setting audio position:', error);
            this.setState({ error: 'Failed to update audio position' });
        }
    }

    onPressPlayPause = async () => {
        if (this.state.playing) {
            await this.pause();
            return;
        }
        await this.play();
    }

    play = async () => {
        try {
            await this.soundObject.playAsync();
            this.setState({ playing: true });
            this.startMovingDot();
        } catch (error) {
            console.error('Error playing audio:', error);
            this.setState({ error: 'Failed to play audio' });
        }
    }

    pause = async () => {
        try {
            await this.soundObject.pauseAsync();
            this.setState({ playing: false });
            Animated.timing(this.state.dotOffset).stop();
        } catch (error) {
            console.error('Error pausing audio:', error);
            this.setState({ error: 'Failed to pause audio' });
        }
    }

    startMovingDot = async () => {
        try {
            const status = await this.soundObject.getStatusAsync();
            let durationLeft;
            
            if (Platform.OS === 'web') {
                // Convert seconds to milliseconds for web
                durationLeft = Math.max(0, (status.durationMillis - status.positionMillis) * 1000);
            } else {
                durationLeft = Math.max(0, status.durationMillis - status.positionMillis);
            }

            Animated.timing(this.state.dotOffset, {
                toValue: {
                    x: this.state.trackLayout.width || 0,
                    y: 0
                },
                duration: durationLeft,
                easing: Easing.linear,
                useNativeDriver: false
            }).start(() => this.animationPausedOrStopped());
        } catch (error) {
            console.error('Error starting dot animation:', error);
            this.setState({ error: 'Failed to start playback' });
        }
    }

    animationPausedOrStopped = async () => {
        if (!this.state.playing) {
            return;
        }
        await sleep(200);
        this.setState({ playing: false });
        await this.soundObject.pauseAsync();
        await this.state.dotOffset.setValue({ x:0, y:0 });
        await this.soundObject.setPositionAsync(0);
    }

    measureTrack = (event) => {
        this.setState({ 'trackLayout': event.nativeEvent.layout });
    }

    async componentDidMount() {
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
            });

            this.soundObject = new Audio.Sound();
            
            const audioSource = typeof this.props.audio === 'string' 
                ? { uri: this.props.audio }
                : this.props.audio;
            
            await this.soundObject.loadAsync(audioSource);
            
            const status = await this.soundObject.getStatusAsync();
            
            // Always store duration in milliseconds internally
            const durationInMs = Platform.OS === 'web' 
                ? status.durationMillis * 1000 
                : status.durationMillis;

            this.setState({ 
                duration: durationInMs,
                isLoading: false 
            });

            this.state.dotOffset.addListener(() => {
                if (!this.state.trackLayout.width) return;
                
                const percentage = Math.min(Math.max(this.state.dotOffset.x._value / this.state.trackLayout.width, 0), 1);
                const newTime = Math.floor(percentage * this.state.duration);
                
                if (!isNaN(newTime) && isFinite(newTime)) {
                    const validTime = Math.max(0, Math.min(newTime, this.state.duration));
                    this.setState({ currentTime: validTime });
                }
            });
        } catch (error) {
            console.error('Error initializing audio:', error);
            this.setState({ 
                error: 'Failed to load audio',
                isLoading: false 
            });
        }
    }

    async componentWillUnmount() {
        try {
            await this.soundObject.unloadAsync();
            this.state.dotOffset.removeAllListeners();
        } catch (error) {
            console.error('Error cleaning up audio:', error);
        }
    }

    render() {
        // For web platform, use native audio element
        if (Platform.OS === 'web') {
            return (
                <View style={styles.container}>
                    <audio
                        controls
                        src={this.props.audio}
                        style={{
                            width: '100%',
                            height: 40,
                            borderRadius: 20,
                        }}
                    >
                        Your browser does not support the audio element.
                    </audio>
                </View>
            );
        }

        // For mobile platforms, show loading state
        if (this.state.isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FF385C" />
                </View>
            );
        }

        // For mobile platforms, show error state
        if (this.state.error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{this.state.error}</Text>
                </View>
            );
        }

        // For mobile platforms, show custom player
        return (
            <View style={styles.container}>
                <View style={styles.playerRow}>
                    <TouchableOpacity
                        onPress={this.onPressPlayPause}
                        style={styles.playButton}
                    >
                        {this.state.playing ? (
                            <MaterialIcons name="pause" size={24} color={colors.primary} />
                        ) : (
                            <Entypo name="controller-play" size={24} color={colors.primary} />
                        )}
                    </TouchableOpacity>

                    <View style={styles.sliderContainer}>
                        <Animated.View
                            onLayout={this.measureTrack}
                            style={styles.track}
                        >
                            <Animated.View
                                style={[
                                    styles.thumbContainer,
                                    {
                                        transform: [{
                                            translateX: this.state.dotOffset.x.interpolate({
                                                inputRange: [0, ((this.state.trackLayout.width != undefined) ? this.state.trackLayout.width : 1)],
                                                outputRange: [0, ((this.state.trackLayout.width != undefined) ? this.state.trackLayout.width : 1)],
                                                extrapolate: 'clamp'
                                            })
                                        }],
                                    }
                                ]}
                                {...this._panResponder.panHandlers}
                            >
                                <View style={styles.thumb} />
                            </Animated.View>
                        </Animated.View>

                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>
                                <DigitalTimeString 
                                    time={isNaN(this.state.currentTime) ? 0 : this.state.currentTime} 
                                />
                            </Text>
                            <Text style={styles.timeText}>
                                <DigitalTimeString 
                                    time={isNaN(this.state.duration) ? 0 : this.state.duration} 
                                />
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    playButton: {
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 2,
    },
    sliderContainer: {
        flex: 1,
    },
    track: {
        height: TRACK_SIZE,
        borderRadius: TRACK_SIZE / 2,
        backgroundColor: '#e0e0e0',
        marginVertical: 10,  // Add vertical margin to center the track
    },
    thumbContainer: {
        position: 'absolute',
        top: -8,  // Adjust this to center the thumb vertically
        left: -(THUMB_SIZE / 2) + 5,
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: colors.primary,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    timeText: {
        fontSize: 12,
        color: '#666',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',  // Use monospace font for consistent number width
    },
    loadingContainer: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        padding: 15,
        backgroundColor: '#ffebee',
        borderRadius: 14,
    },
    errorText: {
        color: '#c62828',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default AudioSlider; 