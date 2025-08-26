import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView, Image, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getPets, PetData } from '../../utils/pets.utils';
import { isAuthenticated } from '../../utils/auth.utils';

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f7f7f7' 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#fff',
        elevation: 2,
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#000' 
    },
    addPetBtn: {
        backgroundColor: '#045b26',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        elevation: 2,
    },
    addPetText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 11 
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 16,
        marginBottom: 16,
    },
    searchText: { 
        color: '#999', 
        fontSize: 16, 
        flex: 1, 
        marginLeft: 12 
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    filterBtn: {
        flex: 1,
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderRadius: 8,
        marginRight: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
    },
    filterBtnActive: {
        backgroundColor: '#045b26',
        borderColor: '#045b26',
    },
    filterBtnInactive: {
        backgroundColor: '#fff',
        borderColor: '#045b26',
    },
    filterText: { 
        fontSize: 11, 
        fontWeight: '500',
        textAlign: 'center',
        width: '100%',
    },
    filterTextActive: { 
        color: '#fff' 
    },
    filterTextInactive: { 
        color: '#045b26' 
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    emptyStateText: { 
        fontSize: 18, 
        color: '#000', 
        textAlign: 'center',
        marginTop: 16,
    },
    petsContainer: {
        paddingBottom: 24,
    },
    petCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#045b26',
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    petImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    petImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        resizeMode: 'cover',
    },
    petInfoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    petName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#045b26',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    petId: {
        fontSize: 12,
        color: '#045b26',
        fontWeight: '500',
    },
});

export default function PetProfilePage({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
    const [activeFilter, setActiveFilter] = useState('All');
    const [pets, setPets] = useState<PetData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        checkAuthAndLoadPets();
    }, []);

    const checkAuthAndLoadPets = async () => {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            Alert.alert(
                'Authentication Required',
                'Please login to view your pets',
                [{ text: 'OK', onPress: () => onNavigate('Login') }]
            );
            return;
        }
        loadPets();
    };

    const loadPets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Loading pets from API...');
            const result = await getPets();
            console.log('API response:', result);
            
            if (result.success && Array.isArray(result.data)) {
                setPets(result.data);
                console.log(`Loaded ${result.data.length} pets`);
                // Debug: Log pet data to see photo_url
                result.data.forEach((pet, index) => {
                    console.log(`Pet ${index + 1}:`, {
                        name: pet.name,
                        photo_url: pet.photo_url,
                        hasPhoto: !!pet.photo_url
                    });
                });
            } else {
                const errorMsg = result.message || 'Failed to load pets';
                setError(errorMsg);
                console.error('Failed to load pets:', errorMsg);
                
                // Only show alert if it's not a simple "no pets" case
                if (!errorMsg.includes('No authentication token') && result.data !== null) {
                    Alert.alert('Error', errorMsg);
                }
            }
        } catch (err) {
            const errorMessage = 'Failed to load pets. Please try again.';
            setError(errorMessage);
            console.error('Load pets error:', err);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadPets();
        } finally {
            setRefreshing(false);
        }
    }, [loadPets]);



    const handlePetPress = (pet: PetData) => {
        console.log('Pet selected:', pet);
        // Navigate to pet details page with pet ID
        onNavigate('Pet Details', { petId: pet.id });
    };

    const handleTabPress = (tabName: string) => {
        console.log('Tab pressed:', tabName);
        setActiveFilter(tabName);
        
        // Optional: Add analytics or additional logic here
        switch (tabName) {
            case 'All':
                console.log('Showing all pets');
                break;
            case 'Cats':
                console.log('Filtering to show only cats');
                break;
            case 'Dogs':
                console.log('Filtering to show only dogs');
                break;
            default:
                console.log('Unknown tab:', tabName);
        }
    };

    const getFilteredPets = () => {
        switch (activeFilter) {
            case 'All':
                return pets;
            case 'Cats':
                return pets.filter(pet => pet.species.toLowerCase() === 'cat' || pet.species.toLowerCase() === 'feline');
            case 'Dogs':
                return pets.filter(pet => pet.species.toLowerCase() === 'dog' || pet.species.toLowerCase() === 'canine');
            default:
                return pets;
        }
    };

    const formatPetAge = (dateOfBirth: string | undefined) => {
        if (!dateOfBirth) return '';
        
        try {
            // Assuming dateOfBirth is in YYYY-MM-DD format from backend
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            
            let years = today.getFullYear() - birthDate.getFullYear();
            let months = today.getMonth() - birthDate.getMonth();
            
            if (today.getDate() < birthDate.getDate()) {
                months--;
            }
            
            if (months < 0) {
                years--;
                months += 12;
            }
            
            if (years === 0) {
                return months === 1 ? '1 month old' : `${months} months old`;
            } else if (years === 1 && months === 0) {
                return '1 year old';
            } else if (months === 0) {
                return `${years} years old`;
            } else {
                return `${years}y ${months}m old`;
            }
        } catch (error) {
            return '';
        }
    };

    const filteredPets = getFilteredPets();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.title}>See my pets</Text>
                <TouchableOpacity 
                    style={styles.addPetBtn}
                    onPress={() => onNavigate('Register Pet')}
                >
                    <Text style={styles.addPetText}>Add new pet</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#045b26"]} />
                }
            >
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <MaterialIcons name="menu" size={22} color="#666" />
                    <Text style={styles.searchText}>Search here</Text>
                    <MaterialIcons name="search" size={22} color="#666" />
                </View>

                {/* Filter Buttons */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.filterBtn, 
                            activeFilter === 'All' ? styles.filterBtnActive : styles.filterBtnInactive
                        ]}
                        onPress={() => handleTabPress('All')}
                    >
                        <Text style={[
                            styles.filterText, 
                            activeFilter === 'All' ? styles.filterTextActive : styles.filterTextInactive
                        ]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterBtn, 
                            activeFilter === 'Cats' ? styles.filterBtnActive : styles.filterBtnInactive
                        ]}
                        onPress={() => handleTabPress('Cats')}
                    >
                        <Text style={[
                            styles.filterText, 
                            activeFilter === 'Cats' ? styles.filterTextActive : styles.filterTextInactive
                        ]}>
                            Cats
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterBtn, 
                            activeFilter === 'Dogs' ? styles.filterBtnActive : styles.filterBtnInactive
                        ]}
                        onPress={() => handleTabPress('Dogs')}
                    >
                        <Text style={[
                            styles.filterText, 
                            activeFilter === 'Dogs' ? styles.filterTextActive : styles.filterTextInactive
                        ]}>
                            Dogs
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Pet Display Area */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#045b26" />
                        <Text style={{ marginTop: 16, color: '#666', fontSize: 16 }}>Loading pets...</Text>
                    </View>
                ) : error ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialIcons name="error-outline" size={48} color="#ff6b6b" />
                        <Text style={{ marginTop: 16, color: '#ff6b6b', fontSize: 16, textAlign: 'center' }}>
                            {error}
                        </Text>
                        <TouchableOpacity 
                            style={{ 
                                backgroundColor: '#045b26', 
                                paddingHorizontal: 20, 
                                paddingVertical: 10, 
                                borderRadius: 8, 
                                marginTop: 16 
                            }}
                            onPress={loadPets}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredPets.length > 0 ? (
                    <View style={styles.petsContainer}>
                        {filteredPets.map((pet) => (
                            <TouchableOpacity 
                                key={pet.id} 
                                style={styles.petCard}
                                onPress={() => handlePetPress(pet)}
                            >
                                <View style={styles.petImageContainer}>
                                    {pet.photo_url ? (
                                        <Image 
                                            source={{ uri: pet.photo_url }} 
                                            style={styles.petImage}
                                            onError={() => console.log('Failed to load pet image:', pet.photo_url)}
                                            onLoad={() => console.log('Successfully loaded pet image:', pet.photo_url)}
                                        />
                                    ) : (
                                        <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            {/* Custom landscape icon with mountains and sun */}
                                            <View style={{ width: 60, height: 40, position: 'relative' }}>
                                                {/* Sun/Moon circle */}
                                                <View style={{
                                                    position: 'absolute',
                                                    top: 2,
                                                    right: 8,
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: 6,
                                                    backgroundColor: '#fff',
                                                    borderWidth: 1,
                                                    borderColor: '#fff'
                                                }} />
                                                {/* Mountain peaks */}
                                                <View style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    width: 0,
                                                    height: 0,
                                                    borderLeftWidth: 15,
                                                    borderRightWidth: 15,
                                                    borderBottomWidth: 25,
                                                    borderLeftColor: 'transparent',
                                                    borderRightColor: 'transparent',
                                                    borderBottomColor: '#fff'
                                                }} />
                                                <View style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    width: 0,
                                                    height: 0,
                                                    borderLeftWidth: 12,
                                                    borderRightWidth: 12,
                                                    borderBottomWidth: 20,
                                                    borderLeftColor: 'transparent',
                                                    borderRightColor: 'transparent',
                                                    borderBottomColor: '#fff'
                                                }} />
                                            </View>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.petInfoContainer}>
                                    <Text style={styles.petName}>{pet.name}</Text>
                                    <Text style={styles.petId}>ID: {pet.pet_id}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialIcons name="pets" size={64} color="#ccc" />
                        <Text style={styles.emptyStateText}>You haven't registered any pet yet</Text>
                        <TouchableOpacity 
                            style={{ 
                                backgroundColor: '#045b26', 
                                paddingHorizontal: 20, 
                                paddingVertical: 12, 
                                borderRadius: 8, 
                                marginTop: 16 
                            }}
                            onPress={() => onNavigate('Register Pet')}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Your First Pet</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
