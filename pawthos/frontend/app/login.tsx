import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
// Navigation will be passed as props
import * as auth from '../utils/auth.utils';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#045b26",
        padding: 24,
    },
    logoRow: {
        flexDirection: "row",
        marginBottom: 16,
        marginTop: 24,
    },
    backButton: {
        position: 'absolute',
        top: 32,
        left: 24,
        zIndex: 10,
        padding: 8,
    },
    logo: {
        width: 64,
        height: 64,
        marginRight: 12,
    },
    logo2: {
        width: 64,
        height: 64,
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
        marginBottom: 32,
        textAlign: 'center',
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
    input: {
        flex: 1,
        fontSize: 16,
        color: '#222',
        padding: 0,
        marginLeft: 8,
        height: 48,
    },
    button: {
        width: 200,
        paddingVertical: 14,
        borderRadius: 32,
        backgroundColor: "#2D941C",
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 300, // match input width
        marginBottom: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#e0ffe6',
        borderRadius: 4,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#e0ffe6',
        borderColor: '#045b26',
    },
    link: {
        color: '#e0ffe6',
        textAlign: 'right',
        textDecorationLine: 'underline',
        fontSize: 14,
    },
    error: {
        color: '#ffb3b3',
        marginBottom: 8,
        textAlign: 'center',
    }
});

export default function LoginPage({ navigation }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [remember, setRemember] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        const result = await auth.login(username, password);
        setLoading(false);
        if (!result.success) setError(result.message || "Login failed");
        else navigation.navigate('Main');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Welcome')}>
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
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Login to your account</Text>
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
            <View style={styles.row}>
                <TouchableOpacity style={[styles.checkbox, remember && styles.checkboxChecked]} onPress={() => setRemember(!remember)}>
                    {remember && <MaterialIcons name="check" size={16} color="#045b26" />}
                </TouchableOpacity>
                <Text style={{ color: '#e0ffe6', fontSize: 14, flex: 1 }}>Remember me</Text>
                <TouchableOpacity onPress={() => alert('Forgot password? (placeholder)')}>
                    <Text style={styles.link}>Forgot password?</Text>
                </TouchableOpacity>
            </View>
            <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>LOGIN</Text>}
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Signup')}>
                <Text style={[styles.link, { textAlign: 'center', marginTop: 8 }]}>Don't have an account? Sign Up</Text>
            </Pressable>
        </View>
    );
}
