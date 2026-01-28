import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { DriverProvider } from './contexts/DriverContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <DriverProvider>
        <AppNavigator />
      </DriverProvider>
    </SafeAreaProvider>
  );
}
