import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';

import { usePaymentMethods } from '../hooks';

import {
  ScreenLayout,
  PaymentMethodsList,
  AddPaymentMethodModal
} from '../components';

import apiClient from '../api';

export default function PaymentMethodsScreen() {
  const { driver, hasCompletedOnboarding } = useDriver();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  
  const { paymentMethods, loading, invalidatePaymentMethodsCache } = usePaymentMethods(driver, hasCompletedOnboarding);
  
  const onRefresh = async () => {
    await invalidatePaymentMethodsCache();
  };
  
  const handleAddPaymentMethod = () => {
    setEditingMethod(null);
    setModalVisible(true);
  };
  
  const handleEditPaymentMethod = (method) => {
    setEditingMethod(method);
    setModalVisible(true);
  };
  
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
  
  const handleSetDefault = async (method) => {
    try {
      await apiClient.setDefaultPaymentMethod(method._id);
      Alert.alert(i18n.t('common.success'), i18n.t('payment.defaultSet'));
      await invalidatePaymentMethodsCache();
    } catch (error) {
      Alert.alert(i18n.t('common.error'), error.message || i18n.t('payment.setDefaultError'));
    }
  };
  
  const handleModalSuccess = async (result) => {
    await invalidatePaymentMethodsCache();
  };

  return (
    <ScreenLayout
      title={i18n.t('payment.paymentMethodsTitle')}
      subtitle={`${paymentMethods.length} ${i18n.t('payment.methodsAvailable')}`}
      rightComponent={
        <TouchableOpacity
          onPress={handleAddPaymentMethod}
          style={styles.addButton}
        >
          <MaterialIcons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      }
    >
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

        {}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <AddPaymentMethodModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
        editingMethod={editingMethod}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
