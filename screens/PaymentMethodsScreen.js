import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';

// Import hooks
import { usePaymentMethods } from '../hooks';

// Import components
import {
  ScreenHeader,
  PaymentMethodsList,
  AddPaymentMethodModal
} from '../components';

// Import API
import apiClient from '../api';

export default function PaymentMethodsScreen() {
  const { driver, isAuthenticated } = useDriver();

  // États pour le modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  // Hook personnalisé pour les méthodes de paiement
  const { paymentMethods, loading, invalidatePaymentMethodsCache } = usePaymentMethods(driver, isAuthenticated);

  // Gestionnaire de pull-to-refresh
  const onRefresh = async () => {
    await invalidatePaymentMethodsCache();
  };

  // Ouvrir le modal pour ajouter
  const handleAddPaymentMethod = () => {
    setEditingMethod(null);
    setModalVisible(true);
  };

  // Ouvrir le modal pour modifier
  const handleEditPaymentMethod = (method) => {
    setEditingMethod(method);
    setModalVisible(true);
  };

  // Supprimer une méthode de paiement
  const handleDeletePaymentMethod = (method) => {
    Alert.alert(
      i18n.t('payment.deletePaymentMethod'),
      i18n.t('payment.confirmDelete'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.deletePaymentMethod(method._id);
              Alert.alert(i18n.t('common.success'), i18n.t('payment.methodDeleted'));
              await invalidatePaymentMethodsCache();
            } catch (error) {
              Alert.alert(i18n.t('common.error'), error.message || i18n.t('payment.deleteError'));
            }
          }
        }
      ]
    );
  };

  // Définir comme méthode par défaut
  const handleSetDefault = async (method) => {
    try {
      await apiClient.setDefaultPaymentMethod(method._id);
      Alert.alert(i18n.t('common.success'), i18n.t('payment.defaultSet'));
      await invalidatePaymentMethodsCache();
    } catch (error) {
      Alert.alert(i18n.t('common.error'), error.message || i18n.t('payment.setDefaultError'));
    }
  };

  // Callback après ajout/modification réussie
  const handleModalSuccess = async (result) => {
    await invalidatePaymentMethodsCache();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={i18n.t('payment.paymentMethodsTitle')}
        subtitle={`${paymentMethods.length} ${i18n.t('payment.methodsAvailable')}`}
        rightComponent={
          <TouchableOpacity
            onPress={handleAddPaymentMethod}
            style={styles.addButton}
          >
            <MaterialIcons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
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
          onEdit={handleEditPaymentMethod}
          onDelete={handleDeletePaymentMethod}
          onSetDefault={handleSetDefault}
        />

        {/* Espace en bas pour le scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <AddPaymentMethodModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
        editingMethod={editingMethod}
      />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomSpacer: {
    height: 20,
  },
});
