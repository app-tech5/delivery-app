import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

const AuthGuard = ({
  isAuthenticated,
  driver,
  title = i18n.t('home.reconnect'),
  subtitle = i18n.t('reports.pleaseReconnectHistory'),
  showLoginButton = false,
  onLoginPress,
  containerStyle,
  titleStyle,
  subtitleStyle,
  buttonStyle
}) => {
  if (isAuthenticated && driver) {
    return null; // Ne rien afficher si authentifié
  }

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <View style={styles.centerContent}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
        {showLoginButton && (
          <Button
            title={i18n.t('navigation.login')}
            onPress={onLoginPress}
            buttonStyle={[styles.loginButton, buttonStyle]}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
});

export default AuthGuard;
