import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Easing, ScrollView } from "react-native";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import HomePage from './pages/HomePage';
import FAQsPage from './pages/FAQsPage';
import MyAccountPage from './pages/MyAccountPage';
import AppointmentPage from './pages/AppointmentPage';
import PetProfilePage from './pages/PetProfilePage';
import VaccineHistoryPage from './pages/VaccineHistoryPage';
import MedicalHistoryPage from './pages/MedicalHistoryPage';
import VetHealthPage from './pages/VetHealthPage';
import CertificatePage from './pages/CertificatePage';
import ShippingPermitPage from './pages/ShippingPermitPage';

const MENU_STRUCTURE = [
    { label: 'My account', icon: 'person-outline' },
    { label: 'Home', icon: 'home' },
    { label: 'Appointment', icon: 'event' },
    {
        label: 'Pet information', icon: 'pets', children: [
            { label: 'Pet profile', icon: 'account-circle' },
            { label: 'Vaccine history', icon: 'history' },
            { label: 'Medical history', icon: 'healing' },
            { label: 'Vet health', icon: 'local-hospital' },
            { label: 'Certificate', icon: 'verified-user' },
            { label: 'Shipping permit', icon: 'local-shipping' },
        ]
    },
    {
        label: 'Other services', icon: 'miscellaneous-services', children: [
            { label: 'Vet health', icon: 'local-hospital' },
            { label: 'Certificate (hog/goats)', icon: 'verified-user' },
            { label: 'Shipping permit', icon: 'local-shipping' },
        ]
    },
    { label: `FAQ's`, icon: 'help-outline' },
];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f7f7' },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    menuButton: { padding: 8 },
    logoRow: { flexDirection: 'row', alignItems: 'center' },
    logo: { width: 36, height: 36, marginLeft: 8 },
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
        backgroundColor: '#fff',
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
        color: '#045b26',
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

function CollapsibleMenu({ open, onClose, setSelectedMenu }: { open: boolean, onClose: () => void, setSelectedMenu: (label: string) => void }) {
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
        setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const handleMenuSelect = (label: string) => {
        setSelectedMenu(label);
        onClose();
    };

    return (
        <>
            {open && <TouchableOpacity style={styles.drawerOverlay} onPress={onClose} activeOpacity={1} />}
            <Animated.View style={[styles.drawer, { left: slideAnim }]}>
                <ScrollView style={{ flex: 1 }}>
                    {MENU_STRUCTURE.map((item, idx) => (
                        <View key={item.label}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => item.children ? handleExpand(item.label) : handleMenuSelect(item.label)}
                            >
                                <MaterialIcons name={item.icon as any} size={22} color="#045b26" />
                                <Text style={styles.menuText}>{item.label}</Text>
                                {item.children && (
                                    <MaterialIcons
                                        name={expanded[item.label] ? 'expand-less' : 'expand-more'}
                                        size={22}
                                        color="#045b26"
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
                                            <MaterialIcons name={sub.icon as any} size={20} color="#045b26" />
                                            <Text style={styles.menuText}>{sub.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.logout}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={() => {
                        setSelectedMenu('Home');
                        onClose();
                    }}>
                        <MaterialIcons name="logout" size={22} color="#b71c1c" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </>
    );
}

export default function MainApp() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState('Home');

    // Modular page mapping
    const pageMap: Record<string, React.ReactNode> = {
        Home: <HomePage onSelect={setSelectedMenu} />,
        "My account": <MyAccountPage />,
        "Appointment": <AppointmentPage />,
        "Pet profile": <PetProfilePage />,
        "Vaccine history": <VaccineHistoryPage />,
        "Medical history": <MedicalHistoryPage />,
        "Vet health": <VetHealthPage />,
        "Certificate": <CertificatePage />,
        "Shipping permit": <ShippingPermitPage />,
        "FAQ's": <FAQsPage />,
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
            />
            {content}
        </View>
    );
}
