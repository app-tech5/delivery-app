import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import DeliveriesScreen from '../screens/DeliveriesScreen';
import EarningsScreen from '../screens/EarningsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SupportScreen from '../screens/SupportScreen';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import i18n from '../i18n';
import { colors } from '../global';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#ffffff',
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: 8,
        },
        drawerItemStyle: {
          marginVertical: 2,
          marginHorizontal: 8,
          borderRadius: 8,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: '#666',
        drawerActiveBackgroundColor: 'rgba(0, 0, 0, 0.08)',
        drawerInactiveBackgroundColor: 'transparent',
      }}
    >
      {/* 🏠 ACCUEIL */}
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: i18n.t('navigation.home'),
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="home-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 🚚 LIVRAISONS */}
      <Drawer.Screen
        name="Deliveries"
        component={DeliveriesScreen}
        options={{
          title: i18n.t('navigation.deliveries'),
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="car-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 💰 REVENUS */}
      <Drawer.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          title: i18n.t('home.earnings'),
          drawerIcon: ({ focused, size }) => (
            <MaterialIcons
              name="attach-money"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 📊 HISTORIQUE */}
      <Drawer.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Historique',
          drawerIcon: ({ focused, size }) => (
            <Feather
              name="clock"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 👤 PROFIL */}
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: i18n.t('navigation.profile'),
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="person-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* ⚙️ PARAMÈTRES */}
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Paramètres',
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="settings-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />

      {/* 🆘 SUPPORT */}
      <Drawer.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: 'Support',
          drawerIcon: ({ focused, size }) => (
            <Ionicons
              name="help-circle-outline"
              color={focused ? colors.primary : '#666'}
              size={size}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}