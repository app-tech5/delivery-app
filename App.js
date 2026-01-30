import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { DriverProvider } from './contexts/DriverContext';
import { SettingProvider } from './contexts/SettingContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <DriverProvider>
        <SettingProvider>
          <AppNavigator />
        </SettingProvider>
      </DriverProvider>
    </SafeAreaProvider>
  );
}
