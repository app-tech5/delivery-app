import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { colors } from '../global';
import { config } from '../config';
import { useDriver } from '../contexts/DriverContext';
import i18n from '../i18n';

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useDriver();

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert(i18n.t('auth.signUpFieldsRequired'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(i18n.t('auth.passwordsDoNotMatch'));
      return;
    }
    setIsLoading(true);
    try {
      await register({ name, email, phone, password });
      Alert.alert(i18n.t('auth.signUpSuccessful'));
    } catch (error) {
      Alert.alert(i18n.t('auth.signUpError'), error.message || '');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={colors.auth.gradient1} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" type="material" size={24} color={colors.white} />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animatable.View animation="fadeInUp" duration={1000} style={styles.contentContainer}>
              <Animatable.View animation="bounceIn" delay={300} style={styles.logoContainer}>
                <Icon name="local-shipping" type="material" color={colors.white} size={64} />
                <Text style={styles.appTitle}>{config.APP_NAME}</Text>
                <Text style={styles.appSubtitle}>{i18n.t('auth.signUpSubtitle')}</Text>
              </Animatable.View>

              <Animatable.View animation="fadeInUp" delay={500} style={styles.formContainer}>
                <Text style={styles.welcomeText}>{i18n.t('auth.signUp')}</Text>
                <Text style={styles.subtitleText}>{i18n.t('auth.signUpSubtitle')}</Text>

                <Input
                  placeholder={i18n.t('profile.fullName')}
                  leftIcon={<Icon name="person" type="material" color={colors.primary} size={20} />}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText}
                  placeholderTextColor="#999"
                />
                <Input
                  placeholder={i18n.t('auth.email')}
                  leftIcon={<Icon name="email" type="material" color={colors.primary} size={20} />}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText}
                  placeholderTextColor="#999"
                />
                <Input
                  placeholder={i18n.t('profile.phone')}
                  leftIcon={<Icon name="phone" type="material" color={colors.primary} size={20} />}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText}
                  placeholderTextColor="#999"
                />
                <Input
                  placeholder={i18n.t('auth.password')}
                  leftIcon={<Icon name="lock" type="material" color={colors.primary} size={20} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                      <Icon
                        name={showPassword ? 'visibility-off' : 'visibility'}
                        type="material"
                        color={colors.primary}
                        size={20}
                      />
                    </TouchableOpacity>
                  }
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText}
                  placeholderTextColor="#999"
                />
                <Input
                  placeholder={i18n.t('auth.confirmPassword')}
                  leftIcon={<Icon name="lock-outline" type="material" color={colors.primary} size={20} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
                      <Icon
                        name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                        type="material"
                        color={colors.primary}
                        size={20}
                      />
                    </TouchableOpacity>
                  }
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText}
                  placeholderTextColor="#999"
                />

                <Button
                  title={isLoading ? i18n.t('auth.signingUp') : i18n.t('auth.signUp')}
                  loading={isLoading}
                  disabled={isLoading}
                  buttonStyle={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  containerStyle={styles.primaryButtonContainer}
                  titleStyle={[styles.primaryButtonText, { color: colors.white }]}
                  onPress={handleSignUp}
                  raised
                />

                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.secondaryLink}
                >
                  <Text style={styles.secondaryLinkText}>
                    {i18n.t('auth.alreadyHaveAccount')}{' '}
                    <Text style={styles.secondaryLinkStrong}>{i18n.t('auth.signIn')}</Text>
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 8 : 16,
    left: 16,
    zIndex: 1,
    padding: 8,
  },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputText: {
    color: colors.text.primary,
    fontSize: 16,
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 12,
  },
  primaryButtonContainer: {
    marginTop: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  secondaryLinkText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  secondaryLinkStrong: {
    color: colors.primary,
    fontWeight: '600',
  },
});
