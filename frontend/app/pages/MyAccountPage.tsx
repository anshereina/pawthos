import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUserProfile, getCurrentUser, updateStoredUser, isAuthenticated, updateUserProfile } from '../../utils/auth.utils';
import EditProfileModal from '../modals/EditProfileModal';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f7f7' },
    content: { flex: 1, padding: 24 },
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    avatarContainer: { position: 'relative', marginRight: 20 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0ffe6' },
    editAvatarBtn: { 
        position: 'absolute', 
        bottom: 0, 
        right: 0, 
        backgroundColor: '#045b26', 
        borderRadius: 15, 
        width: 30, 
        height: 30, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff'
    },
    name: { fontSize: 22, fontWeight: 'bold', color: '#045b26' },
    email: { fontSize: 16, color: '#045b26', marginBottom: 8 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#045b26', marginBottom: 8 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    itemIcon: { marginRight: 12 },
    itemText: { fontSize: 15, color: '#333' },
    itemTextEmpty: { fontSize: 15, color: '#999', fontStyle: 'italic' },
    editBtn: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#e0ffe6', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 16 },
    editBtnText: { color: '#045b26', fontWeight: 'bold' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    errorText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 16 },
    retryBtn: { backgroundColor: '#045b26', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    retryBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default function MyAccountPage() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [updating, setUpdating] = useState(false);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Check if user is authenticated
            const isAuth = await isAuthenticated();
            console.log('Is authenticated:', isAuth);
            
            // First try to get from local storage (faster)
            const localUser = await getCurrentUser();
            console.log('Local user data:', localUser);
            if (localUser) {
                setUserData(localUser);
            }
            
            // Then fetch fresh data from backend
            const result = await getUserProfile();
            console.log('=== MYACCOUNT DEBUG ===');
            console.log('Backend result:', result);
            console.log('Local user:', localUser);
            
            // Check if result has user data (id, email, name, etc.)
            if (result && typeof result === 'object' && 'id' in result && 'email' in result) {
                // The backend returns user data directly in the response
                console.log('Setting user data:', result);
                setUserData(result);
                // Update local storage with fresh data
                await updateStoredUser(result);
            } else if (result && typeof result === 'object' && 'success' in result && result.success === false) {
                console.log('Backend failed:', result.message);
                if (!localUser) {
                    setError(result.message || 'Failed to load profile');
                }
            } else {
                console.log('Unexpected response format:', result);
                if (!localUser) {
                    setError('Invalid response from server');
                }
            }
        } catch (err) {
            console.error('Load profile error:', err);
            if (!userData) {
                setError('Network error. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserProfile();
    }, []);

    const handleEditProfile = () => {
        setEditModalVisible(true);
    };

    const handleUpdateProfile = async (updatedData: any) => {
        try {
            setUpdating(true);
            
            // Call the API to update the profile
            const result = await updateUserProfile(updatedData);
            
            if (result.success) {
                // Update local storage and state
                const updatedUserData = { ...userData, ...updatedData };
                await updateStoredUser(updatedUserData);
                setUserData(updatedUserData);
                
                // Close modal
                setEditModalVisible(false);
                
                Alert.alert('Success', 'Profile updated successfully!');
            } else {
                Alert.alert('Error', result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = () => {
        Alert.alert(
            'Change Password',
            'Password change feature is coming soon!',
            [{ text: 'OK' }]
        );
    };

    const handleNotifications = () => {
        Alert.alert(
            'Notifications',
            'Notification settings feature is coming soon!',
            [{ text: 'OK' }]
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#045b26" />
                    <Text style={{ marginTop: 16, color: '#666' }}>Loading profile...</Text>
                </View>
            </View>
        );
    }

    if (error && !userData) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={loadUserProfile}>
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                <View style={styles.profileRow}>
                    <View style={styles.avatarContainer}>
                        {userData?.photo_url ? (
                            <Image 
                                source={{ uri: userData.photo_url }} 
                                style={styles.avatar}
                                defaultSource={require('../../assets/images/icon.png')}
                            />
                        ) : (
                            <Image 
                                source={require('../../assets/images/icon.png')} 
                                style={styles.avatar}
                            />
                        )}
                        <TouchableOpacity style={styles.editAvatarBtn} onPress={handleEditProfile}>
                            <MaterialIcons name="camera-alt" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={styles.name}>{userData?.name || 'User Name'}</Text>
                        <Text style={styles.email}>{userData?.email || 'user@email.com'}</Text>
                        <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
                            <Text style={styles.editBtnText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.itemRow}>
                        <MaterialIcons name="phone" size={20} color="#045b26" style={styles.itemIcon} />
                        <Text style={userData?.phone_number ? styles.itemText : styles.itemTextEmpty}>
                            {userData?.phone_number || 'No phone number added'}
                        </Text>
                    </View>
                    <View style={styles.itemRow}>
                        <MaterialIcons name="location-on" size={20} color="#045b26" style={styles.itemIcon} />
                        <Text style={userData?.address ? styles.itemText : styles.itemTextEmpty}>
                            {userData?.address || 'No address added'}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.itemRow}>
                        <MaterialIcons name="lock-outline" size={20} color="#045b26" style={styles.itemIcon} />
                        <TouchableOpacity onPress={handleChangePassword}>
                            <Text style={styles.itemText}>Change Password</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemRow}>
                        <MaterialIcons name="notifications" size={20} color="#045b26" style={styles.itemIcon} />
                        <TouchableOpacity onPress={handleNotifications}>
                            <Text style={styles.itemText}>Notifications</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            
            <EditProfileModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={handleUpdateProfile}
                userData={userData}
                loading={updating}
            />
        </View>
    );
}
