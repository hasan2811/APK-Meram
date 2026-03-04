import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
    onRetry: () => void;
}

const { width } = Dimensions.get('window');

export default function OfflineScreen({ onRetry }: Props) {
    return (
        <View style={styles.container}>
            {/* Icon no-wifi */}
            <Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>

            <Text style={styles.title}>Tidak Ada Koneksi</Text>
            <Text style={styles.subtitle}>
                Periksa koneksi internet Anda dan coba lagi.
            </Text>

            <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Coba Lagi</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    title: {
        marginTop: 24,
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
    },
    subtitle: {
        marginTop: 8,
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
    },
    button: {
        marginTop: 32,
        backgroundColor: '#3B82F6',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 12,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
