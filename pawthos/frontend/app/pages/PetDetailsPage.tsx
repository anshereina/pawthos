import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getPetById, PetData } from '../../utils/pets.utils';
import { isAuthenticated } from '../../utils/auth.utils';

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: 'transparent',
        },
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: 'transparent',
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    content: {
        flex: 1,
    },
    petImageContainer: {
        height: 500,
        backgroundColor: '#e0ffe6',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginTop: -50,
    },
    petImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainInfoSection: {
        backgroundColor: '#A1D998',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 24,
        paddingTop: 15,
        paddingBottom: 10,
        marginTop: -30,
    },
    petName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#045b26',
        marginBottom: 8,
        textShadowColor: '#fff',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    petId: {
        fontSize: 14,
        color: '#000',
        marginBottom: 0,
        fontWeight: 'normal',
    },
    petNameIdSection: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        backgroundColor: 'transparent',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    primaryButton: {
        backgroundColor: '#045b26',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flex: 1,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flex: 1,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#045b26',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
        textAlign: 'center',
    },
    secondaryButtonText: {
        color: '#045b26',
        fontWeight: '600',
        fontSize: 12,
        textAlign: 'center',
    },
    detailsGrid: {
        backgroundColor: '#A1D998',
        paddingHorizontal: 24,
        paddingTop: 5,
        paddingBottom: 24,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flex: 1,
        marginHorizontal: 4,
        elevation: 2,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        textAlign: 'center',
    },
});

export default function PetDetailsPage({ 
    onNavigate, 
    petId 
}: { 
    onNavigate: (page: string) => void;
    petId?: number;
}) {
    const [petData, setPetData] = useState<PetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (petId) {
            loadPetDetails();
        } else {
            setError('No pet ID provided');
            setLoading(false);
        }
    }, [petId]);

    const loadPetDetails = async () => {
        if (!petId) return;

        try {
            setLoading(true);
            setError(null);

            const authenticated = await isAuthenticated();
            if (!authenticated) {
                Alert.alert(
                    'Authentication Required',
                    'Please login to view pet details',
                    [{ text: 'OK', onPress: () => onNavigate('Login') }]
                );
                return;
            }

            console.log('Loading pet details for ID:', petId);
            const result = await getPetById(petId);
            console.log('Pet details result:', result);

            if (result.success && result.data) {
                setPetData(result.data as PetData);
            } else {
                const errorMsg = result.message || 'Failed to load pet details';
                setError(errorMsg);
                Alert.alert('Error', errorMsg);
            }
        } catch (err) {
            const errorMessage = 'Failed to load pet details. Please try again.';
            setError(errorMessage);
            console.error('Load pet details error:', err);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatPetAge = (dateOfBirth: string | undefined) => {
        if (!dateOfBirth) return 'Unknown';
        
        try {
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
            return 'Unknown';
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Unknown';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Unknown';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.header, { top: 20 }]}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => onNavigate('Pet profile')}
                    >
                        <MaterialIcons name="arrow-back" size={28} color="#045b26" />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#045b26" />
                    <Text style={{ marginTop: 16, color: '#666', fontSize: 16 }}>Loading pet details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !petData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.header, { top: 20 }]}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => onNavigate('Pet profile')}
                    >
                        <MaterialIcons name="arrow-back" size={28} color="#045b26" />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialIcons name="error-outline" size={64} color="#ff6b6b" />
                    <Text style={{ marginTop: 16, color: '#ff6b6b', fontSize: 16, textAlign: 'center' }}>
                        {error || 'Pet not found'}
                    </Text>
                    <TouchableOpacity 
                        style={{ 
                            backgroundColor: '#045b26', 
                            paddingHorizontal: 20, 
                            paddingVertical: 10, 
                            borderRadius: 8, 
                            marginTop: 16 
                        }}
                        onPress={() => onNavigate('Pet profile')}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Back to Pets</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Pet Image */}
                <View style={styles.petImageContainer}>
                    {petData.photo_url ? (
                        <Image source={{ uri: petData.photo_url }} style={styles.petImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialIcons name="pets" size={48} color="#fff" />
                        </View>
                    )}
                    
                    {/* Back Button - Overlay on Image */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => onNavigate('Pet profile')}
                        >
                            <MaterialIcons name="arrow-back" size={28} color="#045b26" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Pet Name and ID - Overlay on Image */}
                    <View style={styles.petNameIdSection}>
                        <Text style={styles.petName}>{petData.name}</Text>
                        <Text style={styles.petId}>Pet ID: {petData.pet_id}</Text>
                    </View>
                </View>

                {/* Main Information Section */}
                <View style={styles.mainInfoSection}>
                </View>

                {/* Detailed Information Grid */}
                <View style={styles.detailsGrid}>
                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={styles.primaryButton}
                            onPress={() => onNavigate('Pet MedRecords')}
                        >
                            <Text style={styles.primaryButtonText}>View Medical History</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.secondaryButton}
                            onPress={() => onNavigate('Pet VacCard')}
                        >
                            <Text style={styles.secondaryButtonText}>View Medical History</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Top Row */}
                    <View style={styles.gridRow}>
                        <View style={styles.detailCard}>
                            <Text style={styles.detailLabel}>Age</Text>
                            <Text style={styles.detailValue}>{formatPetAge(petData.date_of_birth)}</Text>
                        </View>
                        <View style={styles.detailCard}>
                            <Text style={styles.detailLabel}>Type</Text>
                            <Text style={styles.detailValue}>{petData.species}</Text>
                        </View>
                        <View style={styles.detailCard}>
                            <Text style={styles.detailLabel}>Color</Text>
                            <Text style={styles.detailValue}>{petData.color || 'Unknown'}</Text>
                        </View>
                    </View>

                    {/* Bottom Row */}
                    <View style={styles.gridRow}>
                        <View style={styles.detailCard}>
                            <Text style={styles.detailLabel}>Bday</Text>
                            <Text style={styles.detailValue}>{formatDate(petData.date_of_birth)}</Text>
                        </View>
                        <View style={styles.detailCard}>
                            <Text style={styles.detailLabel}>Gender</Text>
                            <Text style={styles.detailValue}>{petData.gender ? petData.gender.charAt(0).toUpperCase() + petData.gender.slice(1) : 'Unknown'}</Text>
                        </View>
                        <View style={styles.detailCard}>
                            <Text style={styles.detailLabel}>Breed</Text>
                            <Text style={styles.detailValue}>{petData.breed || 'Mixed Breed'}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 