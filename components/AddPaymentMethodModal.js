import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import i18n from '../i18n';
import { colors } from '../global';
import apiClient from '../api';
import { normalizePaymentMethod, getPaypalDisplayEmail } from '../utils/paymentMethodUtils';

const AddPaymentMethodModal = ({ visible, onClose, onSuccess, editingMethod = null }) => {
  const insets = useSafeAreaInsets();
  const [methodType] = useState('paypal');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setPaypalEmail('');
  };

  useEffect(() => {
    if (!visible) return;

    if (editingMethod) {
      const method = normalizePaymentMethod(editingMethod);
      setPaypalEmail(getPaypalDisplayEmail(method));
      return;
    }

    resetForm();
  }, [visible, editingMethod]);

  const validateForm = () => {
    if (!paypalEmail || !paypalEmail.includes('@')) {
      Alert.alert(i18n.t('common.error'), i18n.t('payment.invalidEmail'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const paymentData = {
        methodType: 'paypal',
        purpose: 'payout',
        isDefault: editingMethod?.isDefault || false,
        isActive: true,
      };

      const isMaskedEdit = editingMethod && paypalEmail.includes('*');
      if (!isMaskedEdit) {
        paymentData.paypalEmail = paypalEmail.trim();
      }

      const result = editingMethod
        ? await apiClient.updatePaymentMethod(editingMethod._id, paymentData)
        : await apiClient.createPaymentMethod(paymentData);

      resetForm();
      onSuccess?.(result);
      Alert.alert(
        i18n.t('common.success'),
        editingMethod ? i18n.t('payment.methodUpdated') : i18n.t('payment.methodAdded')
      );
    } catch (error) {
      Alert.alert(i18n.t('common.error'), error.message || i18n.t('payment.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentFields = () => (
    <View style={styles.fieldsContainer}>
      <Text style={styles.noteText}>{i18n.t('payment.paypalPayoutNote')}</Text>
      <TextInput
        style={styles.input}
        placeholder={i18n.t('auth.email')}
        value={paypalEmail}
        onChangeText={setPaypalEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={colors.text.secondary}
        testID="payment-form-paypal-email"
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      testID="payment-method-modal"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} testID="payment-modal-close">
            <MaterialIcons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingMethod ? i18n.t('payment.editPayoutMethod') : i18n.t('payment.addPayoutMethod')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderPaymentFields()}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            testID="payment-modal-cancel"
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              {i18n.t('common.cancel')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            testID="payment-modal-submit"
          >
            <Text style={[styles.buttonText, styles.saveButtonText]}>
              {loading
                ? i18n.t('common.loading')
                : editingMethod
                  ? i18n.t('common.update')
                  : i18n.t('common.add')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  typeSelector: {
    marginBottom: 30,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 15,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.background.secondary,
    backgroundColor: colors.background.secondary,
    minWidth: 120,
  },
  typeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  typeOptionText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  typeOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  fieldsContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  noteText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: colors.text.primary,
  },
  saveButtonText: {
    color: colors.white,
  },
});

export default AddPaymentMethodModal;
