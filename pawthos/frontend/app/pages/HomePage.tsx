import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { getDashboardData, DashboardData } from '../../utils/dashboard.utils';

export default function HomePage({ onSelect }: { onSelect: (label: string) => void }) {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    
    const menuItems = [
        { label: 'Schedules of Vaccination', icon: 'calendar-clock', color: '#228B22' },
        { label: "Owner's Responsibility", icon: 'account-multiple', color: '#228B22' },
        { label: 'Animal Bite', icon: 'needle', color: '#228B22' },
        { label: 'How to Retrieve my dog?', icon: 'home', color: '#228B22' },
        { label: 'Common Signs of Rabies in Pets', icon: 'alert-circle', color: '#228B22' },
        { label: 'Safe Handling Tips for Sick Animals', icon: 'shield-check', color: '#228B22' },
        { label: 'Local Laws on Pet Ownership (anti-Rabies Act)', icon: 'gavel', color: '#228B22' },
        { label: "FAQ's and Contact Information", icon: 'help-circle', color: '#228B22' },
    ];

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const result = await getDashboardData();
            if (result.success && result.data) {
                setDashboardData(result.data);
            } else {
                Alert.alert('Error', result.message || 'Failed to load dashboard data');
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            Alert.alert('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getUserName = () => {
        if (dashboardData?.user?.name) {
            return dashboardData.user.name;
        }
        if (dashboardData?.user?.email) {
            // Extract name from email if no name is set
            return dashboardData.user.email.split('@')[0];
        }
        return 'User';
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            <ScrollView style={{ flex: 1, padding: 16 }}>
                {/* Personalized Greeting */}
                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: 24,
                    paddingHorizontal: 24,
                    paddingVertical: 16,
                }}>
                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        flex: 1,
                    }}>
                        <View style={{ 
                            width: 64, 
                            height: 64, 
                            borderRadius: 32, 
                            backgroundColor: '#FFD700',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 20
                        }}>
                            <MaterialIcons name="person" size={32} color="white" />
                        </View>
                        <View style={{ flex: 1 }}>
                            {loading ? (
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 20, color: '#000', fontWeight: 'bold' }}>Loading...</Text>
                                        <ActivityIndicator size="small" color="#045b26" style={{ marginLeft: 8 }} />
                                    </View>
                                    <Text style={{ fontSize: 16, color: '#666' }}>Fetching your data...</Text>
                                </View>
                            ) : (
                                <View>
                                    <Text style={{ fontSize: 18, color: '#000', fontWeight: 'bold' }}>
                                        Hi, {getUserName()}!
                                    </Text>
                                    <Text style={{ fontSize: 16, color: '#666' }}>
                                        {dashboardData?.pets_count ? 
                                            `You have ${dashboardData.pets_count} pet${dashboardData.pets_count === 1 ? '' : 's'}!` :
                                            "Let's take care of your cutie pets!"
                                        }
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                    
                    {/* Bell Notification */}
                    <TouchableOpacity 
                        style={{ 
                            padding: 8,
                            marginLeft: 16,
                        }}
                        onPress={() => onSelect('Notification')}
                    >
                        <Ionicons name="notifications-outline" size={30} color="#045b26" />
                    </TouchableOpacity>
                </View>



                {/* Main Menu Grid */}
                <View style={{ 
                    flexDirection: 'row', 
                    flexWrap: 'wrap', 
                    justifyContent: 'space-between',
                    marginBottom: 80 // Space for floating action button
                }}>
                    {menuItems.map((item, index) => (
                    <TouchableOpacity
                            key={item.label}
                        style={{
                                width: '48%',
                                backgroundColor: item.color,
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 16,
                            alignItems: 'center',
                                elevation: 3,
                                minHeight: 120,
                                justifyContent: 'center'
                        }}
                            onPress={() => {
                                if (item.label === 'Schedules of Vaccination') {
                                    onSelect('Upcoming Vaccination');
                                } else if (item.label === "Owner's Responsibility") {
                                    onSelect("Owner's Responsibility");
                                } else if (item.label === 'Animal Bite') {
                                    onSelect('Animal Bite');
                                } else if (item.label === 'How to Retrieve my dog?') {
                                    onSelect('Retrieve Dog');
                                } else if (item.label === 'Common Signs of Rabies in Pets') {
                                    onSelect('Common Signs of Rabies in Pets');
                                } else {
                                    onSelect(item.label);
                                }
                            }}
                    >
                            <MaterialCommunityIcons 
                                name={item.icon as any} 
                                size={32} 
                                color="white" 
                                style={{ marginBottom: 8 }}
                            />
                            <Text style={{ 
                                color: 'white', 
                                fontWeight: 'bold', 
                                fontSize: 14,
                                textAlign: 'center',
                                lineHeight: 18
                            }}>
                                {item.label}
                            </Text>
                    </TouchableOpacity>
                ))}
            </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    width: 100, // current size
                    height: 100, // current size
                    borderRadius: 50, // current size
                    backgroundColor: '#045b26',
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: 8
                }}
                onPress={() => onSelect('Integration')}
            >
                <FontAwesome5 name="paw" size={50} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
