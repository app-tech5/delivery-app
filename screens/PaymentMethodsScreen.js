import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../global';
import i18n from '../i18n';
import { useIsFocused } from '@react-navigation/native';
import { useDriver } from '../contexts/DriverContext';
import { usePaymentMethods } from '../hooks';
import { ScreenLayout, PaymentMethodsList, AddPaymentMethodModal, StripeConnectPayoutCard } from '../components';
import apiClient from '../api';

export default function PaymentMethodsScreen() {
  const isFocused = useIsFocused();
  const { driver, hasCompletedOnboarding } = useDriver();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  const {
    paymentMethods,
    loading,
    refreshing,
    invalidatePaymentMethodsCache,
  } = usePaymentMethods(driver, hasCompletedOnboarding, isFocused);

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
              await invalidatePaymentMethodsCache();
            } catch (error) {
              Alert.alert(i18n.t('common.error'), error.message || i18n.t('payment.deleteError'));
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (method) => {
    try {
      await apiClient.setDefaultPaymentMethod(method._id);
      await invalidatePaymentMethodsCache();
    } catch (error) {
      Alert.alert(i18n.t('common.error'), error.message || i18n.t('payment.setDefaultError'));
    }
  };

  const handleModalSuccess = async () => {
    setModalVisible(false);
    setEditingMethod(null);
    await invalidatePaymentMethodsCache();
  };

  return (
    <ScreenLayout
      title={i18n.t('payment.payoutMethodsTitle')}
      subtitle={i18n.t('payment.payoutMethodsSubtitle')}
      rightComponent={
        <TouchableOpacity
          onPress={handleAddPaymentMethod}
          style={styles.addButton}
          testID="payment-methods-add-button"
        >
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      }
    >
      <ScrollView
        style={styles.scrollView}
        testID="payment-methods-screen"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={invalidatePaymentMethodsCache}
            colors={[colors.primary]}
          />
        }
      >
        <StripeConnectPayoutCard onPayoutMethodsUpdated={invalidatePaymentMethodsCache} />
        <PaymentMethodsList
          paymentMethods={paymentMethods}
          loading={loading}
          onEdit={handleEditPaymentMethod}
          onDelete={handleDeletePaymentMethod}
          onSetDefault={handleSetDefault}
        />
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <AddPaymentMethodModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingMethod(null);
        }}
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
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
});
