import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from "react-native";
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as auth from '../utils/auth.utils';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#045b26",
    },
    contentContainer: {
        alignItems: "center",
        padding: 24,
        paddingTop: 150,
        minHeight: '100%',
    },
    title: {
        fontSize: 28,
        color: "#fff",
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: "#e0ffe6",
        marginBottom: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#045b26',
        backgroundColor: '#fff',
        marginHorizontal: 6,
    },
    otpInputFocused: {
        borderColor: '#e0ffe6',
        backgroundColor: '#f0fff0',
    },
    button: {
        width: 200,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: "#fff",
        alignItems: "center",
        marginBottom: 16,
        marginTop: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    buttonText: {
        color: "#045b26",
        fontWeight: "bold",
        fontSize: 14,
        letterSpacing: 1,
    },
    resendButton: {
        paddingVertical: 8,
    },
    resendText: {
        color: '#e0ffe6',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    error: {
        color: '#ffb3b3',
        marginBottom: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
    },
    logoRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 6,
    },
    logo2: {
        width: 40,
        height: 40,
    },
    emailText: {
        color: '#e0ffe6',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    timerText: {
        color: '#e0ffe6',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
});

export default function VerifyOTPPage({ navigation }) {
    const [fontsLoaded] = useFonts({ IrishGrover: require('../assets/fonts/IrishGrover-Regular.ttf') });
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState(600); // 10 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    
    const inputRefs = useRef<TextInput[]>([]);

    // Get email from AsyncStorage on component mount
    useEffect(() => {
        const getStoredEmail = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem('otpEmail');
                if (storedEmail) {
                    setEmail(storedEmail);
                } else {
                    // If no email found, go back to signup
                    navigation.navigate('Signup');
                }
            } catch (error) {
                console.error('Error getting stored email:', error);
                navigation.navigate('Signup');
            }
        };
        getStoredEmail();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!fontsLoaded || !email) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (value: string, index: number) => {
        if (value.length > 1) return; // Prevent multiple characters

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError("Please enter all 6 digits");
            return;
        }

        setLoading(true);
        setError(null);

        const result = await auth.verifyOTP(email as string, otpCode);
        setLoading(false);

        if (!result.success) {
            setError(result.message || "Verification failed");
        } else {
            // Clear the stored email
            await AsyncStorage.removeItem('otpEmail');
            
            Alert.alert(
                "Success!", 
                "Your email has been verified successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate('Main') // Navigate to main app
                    }
                ]
            );
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;
        
        setTimer(600);
        setCanResend(false);
        setError(null);
        setOtp(['', '', '', '', '', '']);
        
        // You could call the signup endpoint again to resend OTP
        Alert.alert("OTP Resent", "A new OTP has been sent to your email.");
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.logoRow}>
                    <Image
                        source={require("../assets/images/logo_1.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Image
                        source={require("../assets/images/logo_2.png")}
                        style={styles.logo2}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.title}>Verify Your Email</Text>
                <Text style={styles.subtitle}>
                    We've sent a 6-digit verification code to:
                </Text>
                <Text style={styles.emailText}>{email}</Text>
                <Text style={styles.subtitle}>
                    Please enter the code below to complete your registration.
                </Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => inputRefs.current[index] = ref!}
                            style={[
                                styles.otpInput,
                                digit ? styles.otpInputFocused : {}
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                            keyboardType="numeric"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {timer > 0 && (
                    <Text style={styles.timerText}>
                        Code expires in: {formatTime(timer)}
                    </Text>
                )}

                {error && <Text style={styles.error}>{error}</Text>}

                <Pressable 
                    style={styles.button} 
                    onPress={handleVerifyOTP} 
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#045b26" />
                    ) : (
                        <Text style={styles.buttonText}>VERIFY & CONTINUE</Text>
                    )}
                </Pressable>

                <TouchableOpacity 
                    style={styles.resendButton} 
                    onPress={handleResendOTP}
                    disabled={!canResend}
                >
                    <Text style={[styles.resendText, { opacity: canResend ? 1 : 0.5 }]}>
                        {canResend ? "Resend OTP" : "Resend available after timer expires"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
