import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { colors } from '../global';
import { useDriver } from '../contexts/DriverContext';
import { ScreenHeader } from '../components';
import i18n from '../i18n';

export default function DriverOnboardingScreen() {
  const scrollRef = useRef(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [saving, setSaving] = useState(false);
  const { completeOnboarding, logout } = useDriver();

  const handleSubmit = async () => {
    if (!licenseNumber || !vehicleType || !vehicleModel || !licensePlate) {
      Alert.alert(i18n.t('auth.driverProfileFieldsRequired'));
      return;
    }

    setSaving(true);
    try {
      const result = await completeOnboarding({
        licenseNumber,
        vehicleType,
        vehicleModel,
        licensePlate,
      });
      if (!result.success) {
        Alert.alert(i18n.t('auth.driverProfileCreateError'), result.message || '');
      }
    } catch (error) {
      Alert.alert(i18n.t('auth.driverProfileCreateError'), error.message || '');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {}
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <LinearGradient colors={colors.auth.gradient1} style={styles.header}>
        <Icon name="directions-car" type="material" size={60} color={colors.white} />
        <ScreenHeader
          title={i18n.t('auth.completeDriverProfile')}
          subtitle={i18n.t('auth.completeDriverProfileSubtitle')}
          containerStyle={styles.screenHeader}
          contentStyle={styles.screenHeaderContent}
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
        />
      </LinearGradient>

      <Animatable.View style={styles.footer} animation="fadeInUpBig" duration={900}>
        <ScrollView
          ref={scrollRef}
          style={styles.keyboardView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.form}
        >
            <Input
              placeholder={i18n.t('profile.licenseNumber')}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              autoCapitalize="characters"
              leftIcon={<Icon name="badge" type="material" size={20} color={colors.primary} />}
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              placeholderTextColor={colors.grey[400]}
            />
            <Input
              placeholder={i18n.t('profile.vehicleType')}
              value={vehicleType}
              onChangeText={setVehicleType}
              leftIcon={<Icon name="two-wheeler" type="material" size={20} color={colors.primary} />}
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              placeholderTextColor={colors.grey[400]}
            />
            <Input
              placeholder={i18n.t('profile.vehicleModel')}
              value={vehicleModel}
              onChangeText={setVehicleModel}
              onFocus={scrollToBottom}
              leftIcon={<Icon name="settings" type="material" size={20} color={colors.primary} />}
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              placeholderTextColor={colors.grey[400]}
            />
            <Input
              placeholder={i18n.t('profile.licensePlate')}
              value={licensePlate}
              onChangeText={setLicensePlate}
              onFocus={scrollToBottom}
              autoCapitalize="characters"
              leftIcon={<Icon name="confirmation-number" type="material" size={20} color={colors.primary} />}
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              placeholderTextColor={colors.grey[400]}
            />

            <Button
              title={i18n.t('auth.createDriverProfile')}
              onPress={handleSubmit}
              loading={saving}
              buttonStyle={styles.createButton}
              containerStyle={styles.buttonContainer}
            />

            <TouchableOpacity style={styles.logoutLink} onPress={handleLogout}>
              <Text style={styles.logoutText}>{i18n.t('navigation.logout')}</Text>
            </TouchableOpacity>
        </ScrollView>
      </Animatable.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.auth.background },
  header: {
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  screenHeader: { backgroundColor: 'transparent', padding: 0, marginTop: 16 },
  screenHeaderContent: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.white, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.grey[200], textAlign: 'center' },
  footer: {
    flex: 2,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  keyboardView: { flex: 1 },
  form: { paddingBottom: 8 },
  inputContainer: { marginBottom: 8, paddingHorizontal: 10 },
  input: { fontSize: 16, color: colors.text.primary, paddingLeft: 10 },
  buttonContainer: { marginTop: 16 },
  createButton: { backgroundColor: colors.primary, paddingVertical: 15, borderRadius: 12 },
  logoutLink: { alignItems: 'center', marginTop: 20 },
  logoutText: { color: colors.text.secondary, fontSize: 15 },
});
