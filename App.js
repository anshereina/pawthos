import React, { useState } from 'react';
import { useFonts } from 'expo-font';

// Import your components
import WelcomePage from './pawthos/frontend/app/index';
import LoginPage from './pawthos/frontend/app/login';
import SignupPage from './pawthos/frontend/app/signup';
import VerifyOTPPage from './pawthos/frontend/app/verifyotp';
import MainApp from './pawthos/frontend/app/main';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [fontsLoaded] = useFonts({
    IrishGrover: require('./pawthos/frontend/assets/fonts/IrishGrover-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  // Simple navigation prop
  const navigation = {
    navigate: (screenName) => setCurrentScreen(screenName)
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Welcome':
        return <WelcomePage navigation={navigation} />;
      case 'Login':
        return <LoginPage navigation={navigation} />;
      case 'Signup':
        return <SignupPage navigation={navigation} />;
      case 'VerifyOTP':
        return <VerifyOTPPage navigation={navigation} />;
      case 'Main':
        return <MainApp navigation={navigation} />;
      default:
        return <WelcomePage navigation={navigation} />;
    }
  };

  return renderScreen();
}