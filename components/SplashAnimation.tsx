import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { G, Rect, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const ANIM_DURATION = 4000;

// Bungkus komponen SVG agar bisa dianimasikan via Animated API
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface Props {
    onFinish: () => void;
}

export default function SplashAnimation({ onFinish }: Props) {
    // ── Animated values ──────────────────────────────────────────────
    const floatY = useRef(new Animated.Value(0)).current;
    const helmOpacity = useRef(new Animated.Value(0)).current;
    const helmY = useRef(new Animated.Value(-20)).current;
    const gogglesOpacity = useRef(new Animated.Value(0)).current;
    const gogglesDash = useRef(new Animated.Value(300)).current; // stroke-dashoffset
    const strapOpacity = useRef(new Animated.Value(0)).current;
    const containerOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const T = ANIM_DURATION;

        // ── Float (seluruh SVG naik-turun) ───────────────────────────
        const floatAnim = Animated.loop(
            Animated.sequence([
                Animated.timing(floatY, { toValue: -8, duration: T / 2, useNativeDriver: true }),
                Animated.timing(floatY, { toValue: 0, duration: T / 2, useNativeDriver: true }),
            ])
        );

        // ── Helm: 0-5% opacity 0 + Y -20, 20-80% visible, 90-100% fade out ──
        const helmAnim = Animated.parallel([
            Animated.sequence([
                Animated.timing(helmOpacity, { toValue: 0, duration: T * 0.05, useNativeDriver: true }),
                Animated.timing(helmOpacity, { toValue: 1, duration: T * 0.15, useNativeDriver: true }),
                Animated.timing(helmOpacity, { toValue: 1, duration: T * 0.60, useNativeDriver: true }),
                Animated.timing(helmOpacity, { toValue: 0, duration: T * 0.10, useNativeDriver: true }),
                Animated.timing(helmOpacity, { toValue: 0, duration: T * 0.10, useNativeDriver: true }),
            ]),
            Animated.sequence([
                Animated.timing(helmY, { toValue: -20, duration: T * 0.05, useNativeDriver: true }),
                Animated.timing(helmY, { toValue: 0, duration: T * 0.15, useNativeDriver: true }),
                Animated.timing(helmY, { toValue: 0, duration: T * 0.60, useNativeDriver: true }),
                Animated.timing(helmY, { toValue: -20, duration: T * 0.20, useNativeDriver: true }),
            ]),
        ]);

        // ── Goggles opacity: 0-15% hidden, 16% flash on, 80% hold, 90-100% fade ──
        const gogglesAnim = Animated.sequence([
            Animated.timing(gogglesOpacity, { toValue: 0, duration: T * 0.15, useNativeDriver: true }),
            Animated.timing(gogglesOpacity, { toValue: 1, duration: T * 0.01, useNativeDriver: true }),
            Animated.timing(gogglesOpacity, { toValue: 1, duration: T * 0.64, useNativeDriver: true }),
            Animated.timing(gogglesOpacity, { toValue: 0, duration: T * 0.10, useNativeDriver: true }),
            Animated.timing(gogglesOpacity, { toValue: 0, duration: T * 0.10, useNativeDriver: true }),
        ]);

        // ── Goggles dash: 300→0 (draw effect) ───────────────────────
        const dashAnim = Animated.sequence([
            Animated.delay(T * 0.15),
            Animated.timing(gogglesDash, { toValue: 0, duration: T * 0.20, useNativeDriver: false }),
            Animated.timing(gogglesDash, { toValue: 0, duration: T * 0.55, useNativeDriver: false }),
            Animated.timing(gogglesDash, { toValue: 300, duration: 0, useNativeDriver: false }),
        ]);

        // ── Strap: 0-30% hidden, 40% on, 80% hold, 90-100% fade ──
        const strapAnim = Animated.sequence([
            Animated.timing(strapOpacity, { toValue: 0, duration: T * 0.30, useNativeDriver: true }),
            Animated.timing(strapOpacity, { toValue: 1, duration: T * 0.10, useNativeDriver: true }),
            Animated.timing(strapOpacity, { toValue: 1, duration: T * 0.40, useNativeDriver: true }),
            Animated.timing(strapOpacity, { toValue: 0, duration: T * 0.10, useNativeDriver: true }),
            Animated.timing(strapOpacity, { toValue: 0, duration: T * 0.10, useNativeDriver: true }),
        ]);

        // Jalankan semua animasi bersamaan
        floatAnim.start();
        Animated.parallel([helmAnim, gogglesAnim, dashAnim, strapAnim]).start();

        // Setelah 4s → fadeout seluruh splash → panggil onFinish
        const timeout = setTimeout(() => {
            Animated.timing(containerOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => {
                floatAnim.stop();
                onFinish();
            });
        }, T);

        return () => clearTimeout(timeout);
    }, []);

    const helmTransform = [{ translateY: helmY }];
    const floatTransform = [{ translateY: floatY }];

    return (
        <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
            <Animated.View style={{ transform: floatTransform }}>
                <Svg width={160} height={160} viewBox="0 0 120 120" fill="none">

                    {/* ── Helm ── */}
                    <Animated.View style={{ transform: helmTransform }}>
                        <G fill="#3B82F6" opacity={helmOpacity as any}>
                            <Rect x="10" y="54" width="100" height="14" rx="7" />
                            <Path d="M 44 54 V 16 Q 60 8 76 16 V 54 Z" />
                            <Path d="M 36 54 V 28 A 22 28 0 0 0 16 54 Z" />
                            <Path d="M 84 54 V 28 A 22 28 0 0 1 104 54 Z" />
                        </G>
                    </Animated.View>

                    {/* ── Goggles body (draw animation) ── */}
                    <AnimatedPath
                        d="M 34 76 H 86 A 10 10 0 0 1 96 86 V 88 A 10 10 0 0 1 86 98 H 70 A 10 10 0 0 0 50 98 H 34 A 10 10 0 0 1 24 88 V 86 A 10 10 0 0 1 34 76 Z"
                        stroke="#10B981"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        strokeDasharray="300"
                        strokeDashoffset={gogglesDash}
                        opacity={gogglesOpacity}
                    />

                    {/* ── Strap kiri & kanan ── */}
                    <AnimatedPath
                        d="M 12 82 V 92 M 108 82 V 92"
                        stroke="#10B981"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                        opacity={strapOpacity}
                    />

                </Svg>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width,
        height,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
});
