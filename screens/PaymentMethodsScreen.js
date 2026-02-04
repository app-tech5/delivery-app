import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';

// Import hooks
import { usePaymentMethods } from '../hooks';

// Import components
import {
  ScreenHeader,
  PaymentMethodsList
} from '../components';

export default function PaymentMethodsScreen() {
  const { driver, isAuthenticated } = useDriver();

  // Hook personnalisé pour les méthodes de paiement
  const { paymentMethods, loading, invalidatePaymentMethodsCache } = usePaymentMethods(driver, isAuthenticated);

  // Gestionnaire de pull-to-refresh
  const onRefresh = async () => {
    await invalidatePaymentMethodsCache();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={i18n.t('payment.paymentMethodsTitle')}
        subtitle={`${paymentMethods.length} ${i18n.t('payment.methodsAvailable')}`}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <PaymentMethodsList
          paymentMethods={paymentMethods}
          loading={loading}
          onRefresh={onRefresh}
        />

        {/* Espace en bas pour le scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacer: {
    height: 20,
  },
});
