import React, { PureComponent } from "react";
import {
    TouchableOpacity,
    Animated,
    PanResponder,
    View,
    Easing,
    StyleSheet,
    ActivityIndicator,
    Alert
} from "react-native";
import { Audio } from 'expo-av';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import sleep from './sleep';
import DigitalTimeString from './DigitalTimeString';

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
            onPanResponderMove: (e, gestureState)=> {
                Animated.event([
                    null, 
                    { dx: this.state.dotOffset.x, dy: this.state.dotOffset.y }
                ])(e, gestureState)
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
            await this.soundObject.setPositionAsync(this.state.currentTime);
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
            const durationLeft = status["durationMillis"] - status["positionMillis"];

            Animated.timing(this.state.dotOffset, {
                toValue: {x: this.state.trackLayout.width, y: 0},
                duration: durationLeft,
                easing: Easing.linear
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
            await this.soundObject.loadAsync(this.props.audio);
            const status = await this.soundObject.getStatusAsync();
            this.setState({ 
                duration: status["durationMillis"],
                isLoading: false 
            });

            this.state.dotOffset.addListener(() => {
                let animatedCurrentTime = this.state.dotOffset.x.interpolate({
                    inputRange: [0, this.state.trackLayout.width],
                    outputRange: [0, this.state.duration],
                    extrapolate: 'clamp'
                }).__getValue();
                this.setState({ currentTime: animatedCurrentTime });
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
        if (this.state.isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FF385C" />
                </View>
            );
        }

        if (this.state.error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{this.state.error}</Text>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <View style={styles.controlsContainer}>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={this.onPressPlayPause}
                    >
                        {this.state.playing ? (
                            <MaterialIcons name="pause" size={30} color="#FF385C" />
                        ) : (
                            <Entypo name="controller-play" size={30} color="#FF385C" />
                        )}
                    </TouchableOpacity>

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
                </View>

                <View style={styles.timeContainer}>
                    <DigitalTimeString time={this.state.currentTime} />
                    <DigitalTimeString time={this.state.duration} />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 14,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: {
            width: 2,
            height: 2,
        },
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
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    playButton: {
        padding: 10,
        marginRight: 10,
    },
    track: {
        flex: 1,
        height: TRACK_SIZE,
        borderRadius: TRACK_SIZE / 2,
        backgroundColor: '#e0e0e0',
    },
    thumbContainer: {
        position: 'absolute',
        left: -(THUMB_SIZE*4 / 2),
        width: THUMB_SIZE*4,
        height: THUMB_SIZE*4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: '#FF385C',
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 5,
    },
});

export default AudioSlider; 