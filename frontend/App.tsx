import React, { useState } from 'react';
import { useFonts } from 'expo-font';

// Import your components
import WelcomePage from './app/index';
import LoginPage from './app/login';
import SignupPage from './app/signup';
import VerifyOTPPage from './app/verifyotp';
import MainApp from './app/main';

// TypeScript types
type ScreenName = 'Welcome' | 'Login' | 'Signup' | 'VerifyOTP' | 'Main';

interface NavigationProps {
  navigate: (screenName: ScreenName) => void;
}

export default function App(): JSX.Element | null {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Welcome');
  const [fontsLoaded] = useFonts({
    IrishGrover: require('./assets/fonts/IrishGrover-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  // Simple navigation prop
  const navigation: NavigationProps = {
    navigate: (screenName: ScreenName) => setCurrentScreen(screenName)
  };

  // Render current screen
  const renderScreen = (): JSX.Element => {
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