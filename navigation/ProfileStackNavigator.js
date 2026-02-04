import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/ProfileScreen';
import VehicleDetailsScreen from '../screens/VehicleDetailsScreen';
import i18n from '../i18n';

const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          title: i18n.t('navigation.profile'),
        }}
      />
      <Stack.Screen
        name="VehicleDetails"
        component={VehicleDetailsScreen}
        options={{
          title: i18n.t('vehicle.vehicleDetailsTitle'),
        }}
      />
    </Stack.Navigator>
  );
}
