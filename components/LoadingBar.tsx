import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface Props {
    progress: number; // 0 to 1
}

export default function LoadingBar({ progress }: Props) {
    const animWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animWidth, {
            toValue: progress,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    if (progress >= 1) return null;

    const widthInterpolated = animWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.track}>
            <Animated.View style={[styles.bar, { width: widthInterpolated }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        height: 3,
        backgroundColor: '#e2e8f0',
        width: '100%',
    },
    bar: {
        height: 3,
        backgroundColor: '#3B82F6',
    },
});
