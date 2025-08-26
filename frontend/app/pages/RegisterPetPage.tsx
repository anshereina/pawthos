import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView, Modal, TouchableWithoutFeedback, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createPet } from '../../utils/pets.utils';
import { getCurrentUser } from '../../utils/auth.utils';

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f7f7f7' 
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#fff',
        elevation: 2,
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#000',
        textAlign: 'center',
        marginBottom: 24,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        overflow: 'visible',
    },
    formSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        marginBottom: 8,
    },
    questionText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 12,
    },
    radioGroup: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#045b26',
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        backgroundColor: '#045b26',
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    radioText: {
        fontSize: 16,
        color: '#333',
    },
    inputField: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    inputFieldDisabled: {
        backgroundColor: '#f5f5f5',
        color: '#666',
        borderColor: '#e0e0e0',
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dropdownContainerActive: {
        borderColor: '#045b26',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    dropdownText: {
        color: '#999',
        fontSize: 16,
    },
    dropdownTextSelected: {
        color: '#333',
        fontSize: 16,
    },
    dropdownOptions: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        zIndex: 1000,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    dropdownOption: {
        paddingHorizontal: 12,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dropdownOptionPressed: {
        backgroundColor: '#f0f8f0',
    },
    dropdownOptionLast: {
        borderBottomWidth: 0,
    },
    dropdownOptionText: {
        fontSize: 16,
        color: '#333',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidthField: {
        width: '48%',
    },
    pictureContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 20,
        backgroundColor: '#f9f9f9',
        marginTop: 8,
    },
    pictureText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    petImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    removePhotoButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePhotoButton: {
        backgroundColor: '#045b26',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 12,
        alignSelf: 'center',
    },
    changePhotoText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    registerButton: {
        backgroundColor: '#045b26',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
        elevation: 3,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default function RegisterPetPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
    const [petName, setPetName] = useState('');
    const [species, setSpecies] = useState('Please Select');
    const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
    const [breed, setBreed] = useState('');
    const [color, setColor] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Please Select');
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);
    const [reproductiveStatus, setReproductiveStatus] = useState<'Intact' | 'Castrated/Spayed' | null>(null);
    const [petPhoto, setPetPhoto] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const speciesOptions = ['Canine', 'Feline'];
    const genderOptions = ['Male', 'Female'];

    // Function to filter out invalid characters (numbers and special characters except spaces, hyphens, apostrophes)
    const filterTextInput = (text: string) => {
        // Remove all characters except letters, spaces, and hyphens
        return text.replace(/[^A-Za-z\s\-]/g, '');
    };

    // Handlers for text input with filtering
    const handlePetNameChange = (text: string) => {
        setPetName(filterTextInput(text));
    };

    const handleBreedChange = (text: string) => {
        setBreed(filterTextInput(text));
    };

    const handleColorChange = (text: string) => {
        setColor(filterTextInput(text));
    };

    const handleSpeciesSelect = (selectedSpecies: string) => {
        setSpecies(selectedSpecies);
        setShowSpeciesDropdown(false);
    };

    const handleGenderSelect = (selectedGender: string) => {
        setGender(selectedGender);
        setShowGenderDropdown(false);
    };

    const formatDateInput = (text: string) => {
        // Normalize dashes to slashes
        const normalized = text.replace(/-/g, '/');
        // Remove all non-numeric and non-slash characters
        const cleaned = normalized.replace(/[^0-9/]/g, '');
        const digits = cleaned.replace(/\//g, '');
        // Format as DD/MM/YYYY progressively
        if (digits.length <= 2) {
            return digits;
        } else if (digits.length <= 4) {
            return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        } else {
            return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
        }
    };

    const getDaysInMonth = (year: number, monthIndexZeroBased: number) => {
        return new Date(year, monthIndexZeroBased + 1, 0).getDate();
    };

    const calculateAge = (dobInput: string) => {
        // Accept DD/MM/YYYY or DD-MM-YYYY
        const normalized = dobInput.replace(/-/g, '/');
        if (normalized.length !== 10) return '';
        const parts = normalized.split('/');
        if (parts.length !== 3) return '';
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
        if (day < 1 || month < 1 || month > 12) return '';
        const birthDate = new Date(year, month - 1, day);
        if (isNaN(birthDate.getTime())) return '';
        const today = new Date();
        // Future dates are invalid
        if (birthDate > today) return '';
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - (birthDate.getMonth());
        let days = today.getDate() - birthDate.getDate();
        if (days < 0) {
            // borrow days from previous month
            const prevMonthIndex = (today.getMonth() - 1 + 12) % 12;
            const prevMonthYear = prevMonthIndex === 11 ? today.getFullYear() - 1 : today.getFullYear();
            const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);
            days += daysInPrevMonth;
            months -= 1;
        }
        if (months < 0) {
            months += 12;
            years -= 1;
        }
        const partsOut: string[] = [];
        if (years > 0) partsOut.push(`${years} year${years > 1 ? 's' : ''}`);
        if (months > 0) partsOut.push(`${months} month${months > 1 ? 's' : ''}`);
        if (days > 0 || partsOut.length === 0) partsOut.push(`${days} day${days !== 1 ? 's' : ''}`);
        return partsOut.join(' ');
    };

    const handleDateOfBirthChange = (text: string) => {
        const formatted = formatDateInput(text);
        setDateOfBirth(formatted);
        const calculatedAge = calculateAge(formatted);
        setAge(calculatedAge);
    };

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Sorry, we need camera roll permissions to select photos.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        Alert.alert(
            'Select Photo',
            'Choose how you want to add a photo',
            [
                {
                    text: 'Camera',
                    onPress: openCamera,
                },
                {
                    text: 'Photo Library',
                    onPress: openImageLibrary,
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Sorry, we need camera permissions to take photos.',
                [{ text: 'OK' }]
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setPetPhoto(result.assets[0].uri);
        }
    };

    const openImageLibrary = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setPetPhoto(result.assets[0].uri);
        }
    };

    const removePhoto = () => {
        Alert.alert(
            'Remove Photo',
            'Are you sure you want to remove this photo?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => setPetPhoto(null),
                },
            ]
        );
    };

    const generatePetId = () => {
        // Generate a simple pet ID format: P-YYYY-XXXX
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        return `P-${year}-${randomNum}`;
    };

    // Validation function to check for letters, spaces, and hyphens only
    const validateTextInput = (text: string, fieldName: string) => {
        // Allow letters, spaces, and hyphens only - exclude quotes, numbers, and special characters
        const validPattern = /^[A-Za-z\s\-]+$/;
        if (!validPattern.test(text)) {
            Alert.alert('Validation Error', `${fieldName} can only contain letters, spaces, and hyphens. Numbers, quotes, and special characters are not allowed.`);
            return false;
        }
        return true;
    };

    const validateForm = () => {
        // Check required fields
        if (!petName.trim()) {
            Alert.alert('Validation Error', 'Please enter pet name');
            return false;
        }

        // Validate pet name
        if (!validateTextInput(petName.trim(), 'Pet name')) {
            return false;
        }
        
        if (species === 'Please Select') {
            Alert.alert('Validation Error', 'Please select pet species');
            return false;
        }

        // Validate breed if provided
        if (breed.trim() && !validateTextInput(breed.trim(), 'Breed')) {
            return false;
        }

        // Validate color if provided
        if (color.trim() && !validateTextInput(color.trim(), 'Color')) {
            return false;
        }

        if (gender === 'Please Select') {
            Alert.alert('Validation Error', 'Please select pet gender');
            return false;
        }

        if (!reproductiveStatus) {
            Alert.alert('Validation Error', 'Please select reproductive status');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        try {
            setIsRegistering(true);

            // Always generate a new pet ID for registration
            const finalPetId = generatePetId();

            // Get current user info for owner name
            const currentUser = await getCurrentUser();
            const ownerName = currentUser?.name || 'Pet Owner';

            // Convert date from DD/MM/YYYY (or DD-MM-YYYY) to YYYY-MM-DD format for backend
            let formattedDateOfBirth = undefined;
            if (dateOfBirth && dateOfBirth.length === 10) {
                const normalized = dateOfBirth.replace(/-/g, '/');
                const parts = normalized.split('/');
                if (parts.length === 3) {
                    // Convert DD/MM/YYYY to YYYY-MM-DD
                    formattedDateOfBirth = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }

            const petData = {
                pet_id: finalPetId,
                name: petName.trim(),
                owner_name: ownerName,
                species: species.toLowerCase() === 'canine' ? 'Dog' : 'Cat',
                date_of_birth: formattedDateOfBirth,
                color: color.trim() || undefined,
                breed: breed.trim() || undefined,
                gender: gender.toLowerCase(),
                reproductive_status: reproductiveStatus?.toLowerCase(),
                photo_url: petPhoto || undefined,
            };

            console.log('Registering pet with data:', petData);

            const result = await createPet(petData);

            if (result.success) {
                // Use returned pet ID if available
                const returnedId = (Array.isArray(result.data) ? undefined : (result.data as any)?.pet_id) || finalPetId;
                Alert.alert(
                    'Success!',
                    `${petName} has been registered successfully with ID: ${returnedId}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Reset form
                                setPetName('');
                                setSpecies('Please Select');
                                setBreed('');
                                setColor('');
                                setDateOfBirth('');
                                setAge('');
                                setGender('Please Select');
                                setReproductiveStatus(null);
                                setPetPhoto(null);
                                
                                // Navigate back to pet profile or main page
                                if (onNavigate) {
                                    onNavigate('Pet profile');
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Registration Failed', result.message || 'Failed to register pet. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Error', 'An error occurred while registering the pet. Please try again.');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={() => { setShowSpeciesDropdown(false); setShowGenderDropdown(false); }}>
                <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Register your Pet</Text>
                </View>

                <View style={styles.formContainer}>
                    {/* Pet's Name */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Pet's Name</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="Enter pet's name"
                            placeholderTextColor="#999"
                            value={petName}
                            onChangeText={handlePetNameChange}
                        />
                    </View>

                    {/* Type of Species */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Type of Species</Text>
                        <View style={{ position: 'relative' }}>
                            <TouchableOpacity 
                                style={[
                                    styles.dropdownContainer,
                                    showSpeciesDropdown && styles.dropdownContainerActive
                                ]}
                                onPress={() => setShowSpeciesDropdown(!showSpeciesDropdown)}
                            >
                                <Text style={[
                                    species === 'Please Select' ? styles.dropdownText : styles.dropdownTextSelected
                                ]}>
                                    {species}
                                </Text>
                                <MaterialIcons 
                                    name={showSpeciesDropdown ? "arrow-drop-up" : "arrow-drop-down"} 
                                    size={24} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                            
                            {showSpeciesDropdown && (
                                <View style={styles.dropdownOptions}>
                                    {speciesOptions.map((option, index) => (
                                        <Pressable 
                                            key={option}
                                            style={({ pressed }) => [
                                                styles.dropdownOption,
                                                index === speciesOptions.length - 1 && styles.dropdownOptionLast,
                                                pressed && styles.dropdownOptionPressed
                                            ]}
                                            onPress={() => handleSpeciesSelect(option)}
                                        >
                                            <Text style={styles.dropdownOptionText}>{option}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Breed and Color */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Breed and Color</Text>
                        <View style={styles.rowContainer}>
                            <TextInput
                                style={[styles.inputField, styles.halfWidthField]}
                                placeholder="Breed"
                                placeholderTextColor="#999"
                                value={breed}
                                onChangeText={handleBreedChange}
                            />
                            <TextInput
                                style={[styles.inputField, styles.halfWidthField]}
                                placeholder="Color"
                                placeholderTextColor="#999"
                                value={color}
                                onChangeText={handleColorChange}
                            />
                        </View>
                    </View>

                    {/* Date of Birth and Age */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Date of Birth and Age</Text>
                        <View style={styles.rowContainer}>
                            <TextInput
                                style={[styles.inputField, styles.halfWidthField]}
                                placeholder="DD/MM/YYYY"
                                placeholderTextColor="#999"
                                value={dateOfBirth}
                                onChangeText={handleDateOfBirthChange}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                            <TextInput
                                style={[styles.inputField, styles.halfWidthField, styles.inputFieldDisabled]}
                                placeholder="Age"
                                placeholderTextColor="#999"
                                value={age}
                                editable={false}
                            />
                        </View>
                    </View>

                    {/* Gender */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Gender</Text>
                        <View style={{ position: 'relative' }}>
                            <TouchableOpacity 
                                style={[
                                    styles.dropdownContainer,
                                    showGenderDropdown && styles.dropdownContainerActive
                                ]}
                                onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                            >
                                <Text style={[
                                    gender === 'Please Select' ? styles.dropdownText : styles.dropdownTextSelected
                                ]}>
                                    {gender}
                                </Text>
                                <MaterialIcons 
                                    name={showGenderDropdown ? "arrow-drop-up" : "arrow-drop-down"} 
                                    size={24} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                            
                            {showGenderDropdown && (
                                <View style={styles.dropdownOptions}>
                                    {genderOptions.map((option, index) => (
                                        <Pressable 
                                            key={option}
                                            style={({ pressed }) => [
                                                styles.dropdownOption,
                                                index === genderOptions.length - 1 && styles.dropdownOptionLast,
                                                pressed && styles.dropdownOptionPressed
                                            ]}
                                            onPress={() => handleGenderSelect(option)}
                                        >
                                            <Text style={styles.dropdownOptionText}>{option}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Reproductive Status</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity 
                                style={styles.radioOption}
                                onPress={() => setReproductiveStatus('Intact')}
                            >
                                <View style={[
                                    styles.radioButton,
                                    reproductiveStatus === 'Intact' && styles.radioButtonSelected
                                ]}>
                                    {reproductiveStatus === 'Intact' && <View style={styles.radioDot} />}
                                </View>
                                <Text style={styles.radioText}>Intact</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.radioOption}
                                onPress={() => setReproductiveStatus('Castrated/Spayed')}
                            >
                                <View style={[
                                    styles.radioButton,
                                    reproductiveStatus === 'Castrated/Spayed' && styles.radioButtonSelected
                                ]}>
                                    {reproductiveStatus === 'Castrated/Spayed' && <View style={styles.radioDot} />}
                                </View>
                                <Text style={styles.radioText}>Castrated/Spayed</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Picture Upload */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Attached Picture here</Text>
                        {petPhoto ? (
                            <View>
                                <View style={styles.imageContainer}>
                                    <Image source={{ uri: petPhoto }} style={styles.petImage} />
                                    <TouchableOpacity 
                                        style={styles.removePhotoButton}
                                        onPress={removePhoto}
                                    >
                                        <MaterialIcons name="close" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity 
                                    style={styles.changePhotoButton}
                                    onPress={pickImage}
                                >
                                    <Text style={styles.changePhotoText}>Change Photo</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                style={styles.pictureContainer}
                                onPress={pickImage}
                            >
                                <MaterialIcons name="add-photo-alternate" size={48} color="#ccc" />
                                <Text style={styles.pictureText}>Tap to add photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Register Button */}
                <TouchableOpacity 
                    style={[styles.registerButton, isRegistering && { opacity: 0.7 }]}
                    onPress={handleRegister}
                    disabled={isRegistering}
                >
                    {isRegistering ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.registerButtonText}>Registering...</Text>
                        </View>
                    ) : (
                        <Text style={styles.registerButtonText}>Register</Text>
                    )}
                </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
} 