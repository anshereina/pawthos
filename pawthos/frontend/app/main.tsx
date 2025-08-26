import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Easing, ScrollView } from "react-native";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
// Navigation will be passed as props
import { useFonts } from 'expo-font';
import HomePage from './pages/HomePage';
import FAQsPage from './pages/FAQsPage';
import MyAccountPage from './pages/MyAccountPage';
import AppointmentPage from './pages/AppointmentPage';
import AppointmentSchedulingPage from './pages/AppointmentSchedulingPage';
import PetProfilePage from './pages/PetProfilePage';
import RegisterPetPage from './pages/RegisterPetPage';
import PetDetailsPage from './pages/PetDetailsPage';
import PetVacCardPage from './pages/PetVacCardPage';
import PetMedRecordsPage from './pages/PetMedRecordsPage';
import VaccineRecordsPage from './pages/VaccineRecordsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import VetHealthPage from './pages/VetHealthPage';
import CertificatePage from './pages/CertificatePage';
import NotificationPage from './pages/NotificationPage';
import UpcomingVaccinationPage from './pages/UpcomingVaccinationPage';
import OwnersResponsibilityPage from './pages/OwnersResponsibilityPage';
import AnimalBitePage from './pages/AnimalBitePage';
import SignOfRabiesPage from './pages/SignOfRabiesPage';
import IntegrationPage from './pages/IntegrationPage';
import IntegrationQuestionsPage from './pages/IntegrationQuestionsPage';
import IntegrationPicturePage from './pages/IntegrationPicturePage';
import IntegrationImageResultPage from './pages/IntegrationImageResultPage';
import IntegrationResultPage from './pages/IntegrationResultPage';
import RetrieveDogPage from './pages/RetrieveDogPage';
import PainAssessmentPage from './pages/PainAssessmentPage';

const MENU_STRUCTURE = [
    {
        label: 'My account', icon: 'person-outline', children: [
            { label: 'Profile', icon: 'account-circle' },
            { label: 'Logout', icon: 'logout' },
        ]
    },
    { label: 'Home', icon: 'home' },
    { label: 'Appointment', icon: 'event' },
    {
        label: 'Pet information', icon: 'pets', children: [
            { label: 'Pet profile', icon: 'account-circle' },
            { label: 'Pain Assessment', icon: 'healing' },
            { label: 'Vaccine Records', icon: 'history' },
            { label: 'Medical Records', icon: 'healing' },
            { label: 'Vet Health Cert', icon: 'healing' },
        ]
    },
    {
        label: 'Other services', icon: 'miscellaneous-services', children: [
            { label: 'Local Shipment (Hogs)', icon: 'local-shipping' },
            { label: 'VetHealth', icon: 'healing' },
        ]
    },
];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f7f7' },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start', // changed from 'space-between'
        backgroundColor: '#045b26',
        height: 125, // increased height
        paddingHorizontal: 16,
        paddingTop: 32,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    menuButton: { padding: 8, flexDirection: 'row', alignItems: 'center' },
    logoRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }, // logoRow now floats right
    logo: { width: 36, height: 36, marginLeft: 8 },
    appName: { 
        fontSize: 24, 
        color: '#D37F52',
        fontWeight: 'bold',
        fontFamily: 'IrishGrover',
        marginLeft: 8
    },
    drawerOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 10,
    },
    drawer: {
        position: 'absolute',
        top: 0, left: 0, bottom: 0,
        width: 270,
        backgroundColor: 'rgba(4,91,38,0.88)',
        zIndex: 20,
        paddingTop: 64,
        paddingHorizontal: 0,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        elevation: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    menuText: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 16,
        fontWeight: '500',
    },
    submenu: {
        paddingLeft: 36,
    },
    logout: {
        position: 'absolute',
        bottom: 32,
        left: 0,
        width: '100%',
        paddingHorizontal: 20,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    logoutText: {
        fontSize: 16,
        color: '#b71c1c',
        marginLeft: 16,
        fontWeight: 'bold',
    },
});

function CollapsibleMenu({ open, onClose, setSelectedMenu, navigation }: { open: boolean, onClose: () => void, setSelectedMenu: (label: string) => void, navigation: any }) {
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
    const slideAnim = React.useRef(new Animated.Value(-270)).current;

    React.useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: open ? 0 : -270,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [open]);

    const handleExpand = (label: string) => {
        setExpanded((prev: { [key: string]: boolean }) => ({ ...prev, [label]: !prev[label] }));
    };

    const handleMenuSelect = (label: string) => {
        if (label === 'Logout') {
            onClose();
                            navigation.navigate('Login');
        } else if (label === 'Profile') {
            setSelectedMenu('My account');
            onClose();
        } else {
            setSelectedMenu(label);
            onClose();
        }
    };

    return (
        <>
            {open && <TouchableOpacity style={styles.drawerOverlay} onPress={onClose} activeOpacity={1} />}
            <Animated.View style={[styles.drawer, { left: slideAnim }]}> 
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
                    {MENU_STRUCTURE.map((item, idx) => (
                        <View key={item.label}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => item.children ? handleExpand(item.label) : handleMenuSelect(item.label)}
                            >
                                <MaterialIcons name={item.icon as any} size={22} color="#fff" />
                                <Text style={styles.menuText}>{item.label}</Text>
                                {item.children && (
                                    <MaterialIcons
                                        name={expanded[item.label] ? 'expand-less' : 'expand-more'}
                                        size={22}
                                        color="#fff"
                                        style={{ marginLeft: 'auto' }}
                                    />
                                )}
                            </TouchableOpacity>
                            {item.children && expanded[item.label] && (
                                <View style={styles.submenu}>
                                    {item.children.map((sub, subIdx) => (
                                        <TouchableOpacity
                                            key={sub.label}
                                            style={styles.menuItem}
                                            onPress={() => handleMenuSelect(sub.label)}
                                        >
                                            <MaterialIcons name={sub.icon as any} size={20} color="#fff" />
                                            <Text style={styles.menuText}>{sub.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </Animated.View>
        </>
    );
}

export default function MainApp({ navigation }) {
    const [fontsLoaded] = useFonts({
        IrishGrover: require('../assets/fonts/IrishGrover-Regular.ttf'),
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState('Home');
    const [appointmentType, setAppointmentType] = useState<string | undefined>(undefined);
    const [navigationData, setNavigationData] = useState<any>({});
    const [selectedPetType, setSelectedPetType] = useState<string>('dog');

    const handleNavigation = (page: string, appointmentTypeParam?: string) => {
        if (appointmentTypeParam) {
            setAppointmentType(appointmentTypeParam);
        }
        setSelectedMenu(page);
    };

    const navigateWithData = (page: string, data?: any) => {
        setNavigationData(data || {});
        setSelectedMenu(page);
    };

    if (!fontsLoaded) return null;

    // Modular page mapping
    const pageMap: Record<string, any> = {
        Home: <HomePage onSelect={setSelectedMenu} />, 
        "My account": <MyAccountPage />, 
        "Appointment": <AppointmentPage onNavigate={setSelectedMenu} />, 
        "Appointment Scheduling": <AppointmentSchedulingPage initialAppointmentType={appointmentType} onBack={() => setSelectedMenu('Appointment')} />, 
        "Pet profile": <PetProfilePage onNavigate={navigateWithData} />,
        "Pain Assessment": <PainAssessmentPage onNavigate={navigateWithData} />, 
        "Register Pet": <RegisterPetPage />, 
        "Pet Details": <PetDetailsPage onNavigate={setSelectedMenu} petId={navigationData.petId} />, 
        "Pet VacCard": <PetVacCardPage onNavigate={navigateWithData} />, 
        "Pet MedRecords": <PetMedRecordsPage onNavigate={navigateWithData} />, 
        "Vaccine Records": <VaccineRecordsPage onNavigate={setSelectedMenu} />, 
        "Medical Records": <MedicalRecordsPage onNavigate={setSelectedMenu} />, 
        "Vet Health Cert": <VetHealthPage onNavigate={handleNavigation} />, 
        "Certificate": <CertificatePage />, 
        "Vet Health": <VetHealthPage onNavigate={handleNavigation} />, 
        "FAQ's": <FAQsPage />, 
        "Notification": <NotificationPage />,
        "Upcoming Vaccination": <UpcomingVaccinationPage onBack={() => setSelectedMenu('Home')} />,
        "Owner's Responsibility": <OwnersResponsibilityPage onBack={() => setSelectedMenu('Home')} />,
        "Animal Bite": <AnimalBitePage onBack={() => setSelectedMenu('Home')} />,
        "Retrieve Dog": <RetrieveDogPage onBack={() => setSelectedMenu('Home')} />,
        "Common Signs of Rabies in Pets": <SignOfRabiesPage onBack={() => setSelectedMenu('Home')} />,
        "Integration": <IntegrationPage onSelect={setSelectedMenu} />,
        "IntegrationQuestionsDog": <IntegrationQuestionsPage petType="dog" onBack={() => setSelectedMenu('Integration')} onNext={() => { setSelectedPetType('dog'); setSelectedMenu('IntegrationPicture'); }} />,
        "IntegrationQuestionsCat": <IntegrationQuestionsPage petType="cat" onBack={() => setSelectedMenu('Integration')} onNext={() => { setSelectedPetType('cat'); setSelectedMenu('IntegrationPicture'); }} />,
        "IntegrationPicture": <IntegrationPicturePage onResult={(result, imageUri) => { setNavigationData({ painLevel: result, capturedImage: imageUri }); setSelectedMenu('IntegrationImageResult'); }} onBack={() => setSelectedMenu('Integration')} />,
        "IntegrationImageResult": <IntegrationImageResultPage onRetake={() => setSelectedMenu('IntegrationPicture')} onSeeResult={() => setSelectedMenu('IntegrationResult')} capturedImage={navigationData.capturedImage} />,
        "IntegrationResult": <IntegrationResultPage 
            onSecondOpinion={() => setSelectedMenu('IntegrationPicture')} 
            onHome={() => setSelectedMenu('Home')} 
            onSave={() => setSelectedMenu('Pain Assessment')}
            onSecondOpinionAppointment={() => {
                setAppointmentType('Consultation');
                setSelectedMenu('Appointment Scheduling');
            }}
            petType={selectedPetType} 
            severityLevel="Unknown" 
            painLevel={navigationData.painLevel}
        />,
        // Add more pages here as you modularize them
    };

    let content = pageMap[selectedMenu] || (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, color: '#045b26', fontWeight: 'bold' }}>{selectedMenu} (placeholder)</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
                    <MaterialIcons name="menu" size={32} color="#fff" />
                    <Text style={styles.appName}>PawThos</Text>
                </TouchableOpacity>
                <View style={styles.logoRow}>
                    <Image source={require("../assets/images/logo_1.png")} style={styles.logo} resizeMode="contain" />
                    <Image source={require("../assets/images/logo_2.png")} style={styles.logo} resizeMode="contain" />
                </View>
            </View>
            <CollapsibleMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                setSelectedMenu={setSelectedMenu}
                navigation={navigation}
            />
            {content}
        </View>
    );
}
