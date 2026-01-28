import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../global';

export default function Loader({ message = "Chargement..." }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.indicator}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  indicator: {
    marginBottom: 20,
    transform: [{ scale: 1.5 }],
  },
  message: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
