import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { colors } from '../global';
import { config } from '../config';
import { useDriver } from '../contexts/DriverContext';
import { ScreenHeader } from '../components';
import i18n from '../i18n';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState(config.DEMO_MODE ? config.DEMO_EMAIL : '');
  const [password, setPassword] = useState(config.DEMO_MODE ? config.DEMO_PASSWORD : '');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useDriver();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(i18n.t('auth.emailAndPasswordRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(email, password);

      if (response.token && response.user) {
        Alert.alert(i18n.t('auth.loginSuccessful'));
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.message === 'Driver profile not found'
        ? i18n.t('auth.driverNotFound')
        : (error.message || i18n.t('auth.loginFailedDefault'));
      Alert.alert(i18n.t('auth.loginError'), message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

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
          <ScreenHeader
            title={config.APP_NAME}
            subtitle={i18n.t('auth.signInSubtitle')}
            containerStyle={styles.screenHeader}
            contentStyle={styles.screenHeaderContent}
            titleStyle={styles.title}
            subtitleStyle={styles.subtitle}
          >
            {config.DEMO_MODE && (
              <Text style={styles.demoText}>{i18n.t('auth.demoMode')}</Text>
            )}
          </ScreenHeader>
        </View>
      </LinearGradient>

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
            <Text style={styles.formTitle}>{i18n.t('auth.signIn')}</Text>

            <Input
              placeholder={i18n.t('auth.email')}
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
              placeholder={i18n.t('auth.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon={
                <Icon
                  name="lock"
                  type="material"
                  size={20}
                  color={colors.primary}
                />
              }
              rightIcon={
                <Icon
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  type="material"
                  size={20}
                  color={colors.grey[500]}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              placeholderTextColor={colors.grey[400]}
            />

            <Button
              title={i18n.t('auth.signIn')}
              onPress={handleLogin}
              loading={isLoading}
              buttonStyle={styles.loginButton}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.buttonText}
            />

            <Button
              title={i18n.t('auth.noAccountSignUp')}
              type="clear"
              onPress={() => navigation.navigate('SignUp')}
              titleStyle={styles.signUpText}
              containerStyle={styles.signUpContainer}
            />

            <Button
              title={i18n.t('auth.forgotPassword')}
              type="clear"
              onPress={() => Alert.alert(i18n.t('auth.comingSoon'))}
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
  screenHeader: {
    backgroundColor: 'transparent',
    padding: 0,
    paddingTop: 0,
    marginTop: 20,
  },
  screenHeaderContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 6,
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
  signUpContainer: {
    marginTop: 10,
  },
  signUpText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 16,
  },
});
