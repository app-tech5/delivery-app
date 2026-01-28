import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../global';
import { config } from '../config';
import apiClient from '../api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState(config.DEMO_MODE ? config.DEMO_EMAIL : '');
  const [password, setPassword] = useState(config.DEMO_MODE ? config.DEMO_PASSWORD : '');
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier si l'utilisateur est déjà connecté au démarrage
  useEffect(() => {
    const checkExistingLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('driverToken');
        const driverData = await AsyncStorage.getItem('driverData');

        if (token && driverData) {
          // L'utilisateur est déjà connecté, aller directement au Home
          navigation.replace('Home');
        }
      } catch (error) {
        console.error('Error checking existing login:', error);
      }
    };

    checkExistingLogin();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      // Appel à l'API driver login
      const response = await apiClient.driverLogin(email, password);

      if (response.token) {
        Alert.alert('Succès', 'Connexion réussie !');
        navigation.replace('Home');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Erreur de connexion',
        error.message || 'Email ou mot de passe incorrect'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {/* Header avec dégradé */}
      <LinearGradient
        colors={colors.auth.gradient1}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Icon
            name="local-shipping"
            type="material"
            size={80}
            color={colors.white}
          />
          <Text style={styles.title}>{config.APP_NAME}</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
          {config.DEMO_MODE && (
            <Text style={styles.demoText}>🚗 Mode démonstration activé</Text>
          )}
        </View>
      </LinearGradient>

      {/* Formulaire */}
      <Animatable.View
        style={styles.footer}
        animation="fadeInUpBig"
        duration={1000}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.form}>
            <Text style={styles.formTitle}>Connexion</Text>

            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Icon
                  name="email"
                  type="material"
                  size={20}
                  color={colors.primary}
                />
              }
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              placeholderTextColor={colors.grey[400]}
            />

            <Input
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={
                <Icon
                  name="lock"
                  type="material"
                  size={20}
                  color={colors.primary}
                />
              }
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              placeholderTextColor={colors.grey[400]}
            />

            <Button
              title="Se connecter"
              onPress={handleLogin}
              loading={isLoading}
              buttonStyle={styles.loginButton}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.buttonText}
            />

            <Button
              title="Mot de passe oublié ?"
              type="clear"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
              titleStyle={styles.forgotPasswordText}
              containerStyle={styles.forgotPasswordContainer}
            />
          </View>
        </KeyboardAvoidingView>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.auth.background,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grey[200],
    textAlign: 'center',
  },
  demoText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
  },
  footer: {
    flex: 2,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  keyboardView: {
    flex: 1,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    fontSize: 16,
    color: colors.text.primary,
    paddingLeft: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  forgotPasswordContainer: {
    marginTop: 15,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 16,
  },
});
