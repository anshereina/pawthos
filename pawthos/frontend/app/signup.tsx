import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { useFonts } from 'expo-font';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as auth from '../utils/auth.utils';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#045b26",
        padding: 24,
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
        marginBottom: 12,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#222',
        padding: 0,
        marginLeft: 8,
        height: 36,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 12,
        width: 280, // smaller width
        paddingHorizontal: 8,
        minHeight: 40,
        paddingVertical: 8,
    },
    button: {
        width: 180,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: "#045b26",
        alignItems: "center",
        marginBottom: 12,
        marginTop: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
        letterSpacing: 1,
    },
    link: {
        color: '#e0ffe6',
        marginTop: 8,
        textAlign: 'center',
    },
    error: {
        color: '#ffb3b3',
        marginBottom: 8,
        textAlign: 'center',
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
});

export default function SignupPage({ navigation }) {
    const [fontsLoaded] = useFonts({ IrishGrover: require('../assets/fonts/IrishGrover-Regular.ttf') });
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!fontsLoaded) return null;

    const handleSignup = async () => {
        setLoading(true);
        setError(null);

        // Validation
        if (!name || !email || !password) {
            setError("Please fill in all required fields");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        const result = await auth.signup(email, password, name, phoneNumber, address);
        setLoading(false);
        if (!result.success) {
            setError(result.message || "Signup failed");
        } else {
            // Store email for OTP verification and show success message
            await AsyncStorage.setItem('otpEmail', email);
            Alert.alert("Success!", result.message || "Account created successfully!", [
                {
                    text: "Continue to Verification", 
                    onPress: () => {
                        console.log("Navigating to OTP screen");
                        navigation.navigate('VerifyOTP');
                    }
                }
            ]);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Welcome')}>
                <MaterialIcons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            
            <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 40 }}>
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>
                
                {/* Full Name */}
                <View style={styles.inputRow}>
                    <MaterialIcons name="person" size={18} color="#045b26" />
                    <TextInput
                        placeholder="Full Name *"
                        placeholderTextColor="#b2d8c5"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        autoCapitalize="words"
                    />
                </View>

                {/* Email */}
                <View style={styles.inputRow}>
                    <MaterialIcons name="email" size={18} color="#045b26" />
                    <TextInput
                        placeholder="Email Address *"
                        placeholderTextColor="#b2d8c5"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                {/* Phone Number */}
                <View style={styles.inputRow}>
                    <MaterialIcons name="phone" size={18} color="#045b26" />
                    <TextInput
                        placeholder="Phone Number"
                        placeholderTextColor="#b2d8c5"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        style={styles.input}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Address */}
                <View style={styles.inputRow}>
                    <MaterialIcons name="location-on" size={18} color="#045b26" />
                    <TextInput
                        placeholder="Address"
                        placeholderTextColor="#b2d8c5"
                        value={address}
                        onChangeText={setAddress}
                        style={styles.input}
                        autoCapitalize="words"
                        multiline={true}
                        numberOfLines={2}
                    />
                </View>

                {/* Password */}
                <View style={styles.inputRow}>
                    <MaterialIcons name="lock-outline" size={18} color="#045b26" />
                    <TextInput
                        placeholder="Password *"
                        placeholderTextColor="#b2d8c5"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        secureTextEntry
                    />
                </View>

                {/* Confirm Password */}
                <View style={styles.inputRow}>
                    <MaterialIcons name="lock-outline" size={18} color="#045b26" />
                    <TextInput
                        placeholder="Confirm Password *"
                        placeholderTextColor="#b2d8c5"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        style={styles.input}
                        secureTextEntry
                    />
                </View>

                <Text style={[styles.subtitle, { fontSize: 12, marginTop: 8, textAlign: 'center' }]}>
                    * Required fields
                </Text>

                {error && <Text style={styles.error}>{error}</Text>}
                
                <Pressable style={styles.button} onPress={handleSignup} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>CREATE ACCOUNT</Text>}
                </Pressable>
                
                <Pressable onPress={() => navigation.navigate('Login')}>
                    <Text style={[styles.link, { textAlign: 'center', marginTop: 8 }]}>Already have an account? Login</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}
