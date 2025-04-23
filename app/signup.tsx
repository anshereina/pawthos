import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useFonts } from 'expo-font';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as auth from './auth';
import { useRouter } from 'expo-router';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#045b26",
        padding: 24,
    },
    title: {
        fontSize: 32,
        color: "#fff",
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: "#e0ffe6",
        marginBottom: 16,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#222',
        padding: 0,
        marginLeft: 8,
        height: 48,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 16,
        width: 300, // wider input
        paddingHorizontal: 10,
        height: 48,
    },
    button: {
        width: 200,
        paddingVertical: 14,
        borderRadius: 32,
        backgroundColor: "#045b26",
        alignItems: "center",
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
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
        width: 50,
        height: 50,
        marginRight: 8,
    },
    logo2: {
        width: 50,
        height: 50,
    },
});

export default function SignupPage() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ IrishGrover: require('../assets/fonts/IrishGrover-Regular.ttf') });
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!fontsLoaded) return null;

    const handleSignup = async () => {
        setLoading(true);
        setError(null);
        const result = await auth.signup(username, password); // Placeholder, add email to backend later
        setLoading(false);
        if (!result.success) setError(result.message || "Signup failed");
        else alert("Signup successful! (placeholder)");
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
                <MaterialIcons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
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
            <View style={styles.inputRow}>
                <FontAwesome name="user" size={22} color="#045b26" />
                <TextInput
                    placeholder="Username"
                    placeholderTextColor="#b2d8c5"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    autoCapitalize="none"
                />
            </View>
            <View style={styles.inputRow}>
                <MaterialIcons name="email" size={22} color="#045b26" />
                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#b2d8c5"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>
            <View style={styles.inputRow}>
                <MaterialIcons name="lock-outline" size={22} color="#045b26" />
                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#b2d8c5"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                />
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
            <Pressable style={styles.button} onPress={handleSignup} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SIGN UP</Text>}
            </Pressable>
            <Pressable onPress={() => router.replace('/login')}>
                <Text style={[styles.link, { textAlign: 'center', marginTop: 8 }]}>Already have an account? Login</Text>
            </Pressable>
        </View>
    );
}
