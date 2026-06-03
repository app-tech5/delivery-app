import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DriverOnboardingScreen from '../screens/DriverOnboardingScreen';
import DrawerNavigator from './DrawerNavigator';
import { useDriver } from '../contexts/DriverContext';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const navigationRef = useRef();
  const { isAuthenticated, isLoading, needsOnboarding } = useDriver();

  useEffect(() => {
    if (!isLoading && navigationRef.current) {
      const navigation = navigationRef.current;

      if (isAuthenticated) {
        const targetRoute = needsOnboarding ? 'DriverOnboarding' : 'DrawerNavigator';
        if (navigation.getCurrentRoute()?.name !== targetRoute) {
          navigation.reset({
            index: 0,
            routes: [{ name: targetRoute }],
          });
        }
      } else {
        const currentRoute = navigation.getCurrentRoute()?.name;
        if (currentRoute !== 'Splash' && currentRoute !== 'Login' && currentRoute !== 'SignUp') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }
    }
  }, [isAuthenticated, isLoading, needsOnboarding]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="DriverOnboarding" component={DriverOnboardingScreen} />
        <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
