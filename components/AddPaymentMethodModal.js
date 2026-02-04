import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import i18n from '../i18n';
import { colors } from '../global';
import apiClient from '../api';

const AddPaymentMethodModal = ({ visible, onClose, onSuccess, editingMethod = null }) => {
  const [methodType, setMethodType] = useState(editingMethod?.methodType || 'credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cvv, setCvv] = useState('');
  const [paypalEmail, setPaypalEmail] = useState(editingMethod?.paypalEmail || '');
  const [loading, setLoading] = useState(false);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setMethodType('credit_card');
    setCardNumber('');
    setExpiryMonth('');
    setExpiryYear('');
    setCardholderName('');
    setCvv('');
    setPaypalEmail('');
  };

  // Validation des données
  const validateForm = () => {
    if (methodType === 'credit_card' || methodType === 'debit_card') {
      if (!cardNumber || !expiryMonth || !expiryYear || !cardholderName || !cvv) {
        Alert.alert(i18n.t('common.error'), i18n.t('payment.fillAllFields'));
        return false;
      }
      if (cardNumber.replace(/\s/g, '').length < 13) {
        Alert.alert(i18n.t('common.error'), i18n.t('payment.invalidCardNumber'));
        return false;
      }
    } else if (methodType === 'paypal') {
      if (!paypalEmail || !paypalEmail.includes('@')) {
        Alert.alert(i18n.t('common.error'), i18n.t('payment.invalidEmail'));
        return false;
      }
    }
    return true;
  };

  // Formater le numéro de carte
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const match = cleaned.match(/\d{1,4}/g);
    const formatted = match ? match.join(' ') : '';
    setCardNumber(formatted);
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let paymentData = {
        methodType,
        isDefault: false, // Par défaut non défini comme défaut
        isActive: true
      };

      if (methodType === 'credit_card' || methodType === 'debit_card') {
        paymentData.cardDetails = {
          cardNumberLast4: cardNumber.slice(-4),
          cardBrand: getCardBrand(cardNumber),
          expiryMonth: parseInt(expiryMonth),
          expiryYear: parseInt(expiryYear),
          cardholderName: cardholderName.trim()
        };
      } else if (methodType === 'paypal') {
        paymentData.paypalEmail = paypalEmail.trim();
      } else if (methodType === 'apple_pay' || methodType === 'google_pay') {
        // Pour les wallets, on génère un token fictif
        paymentData.walletToken = Math.random().toString(36).substring(2, 15);
      }

      let result;
      if (editingMethod) {
        result = await apiClient.updatePaymentMethod(editingMethod._id, paymentData);
      } else {
        result = await apiClient.createPaymentMethod(paymentData);
      }

      Alert.alert(
        i18n.t('common.success'),
        editingMethod ? i18n.t('payment.methodUpdated') : i18n.t('payment.methodAdded'),
        [{ text: i18n.t('common.ok'), onPress: () => {
          resetForm();
          onSuccess?.(result);
          onClose();
        }}]
      );
    } catch (error) {
      Alert.alert(i18n.t('common.error'), error.message || i18n.t('payment.saveError'));
    } finally {
      setLoading(false);
    }
  };

  // Détecter la marque de la carte
  const getCardBrand = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'other';
  };

  // Rendu des options de type de paiement
  const renderPaymentTypeSelector = () => {
    const types = [
      { value: 'credit_card', label: i18n.t('payment.creditCard'), icon: 'credit-card' },
      { value: 'debit_card', label: i18n.t('payment.debitCard'), icon: 'credit-card' },
      { value: 'paypal', label: i18n.t('payment.paypal'), icon: 'paypal' },
      { value: 'apple_pay', label: 'Apple Pay', icon: 'apple' },
      { value: 'google_pay', label: 'Google Pay', icon: 'google' },
    ];

    return (
      <View style={styles.typeSelector}>
        <Text style={styles.sectionTitle}>{i18n.t('payment.selectPaymentType')}</Text>
        <View style={styles.typeOptions}>
          {types.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeOption,
                methodType === type.value && styles.typeOptionSelected
              ]}
              onPress={() => setMethodType(type.value)}
            >
              <MaterialIcons
                name={type.icon === 'paypal' ? 'paypal' : 'credit-card'}
                size={20}
                color={methodType === type.value ? colors.primary : colors.text.secondary}
              />
              <Text style={[
                styles.typeOptionText,
                methodType === type.value && styles.typeOptionTextSelected
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Rendu des champs selon le type de paiement
  const renderPaymentFields = () => {
    if (methodType === 'credit_card' || methodType === 'debit_card') {
      return (
        <View style={styles.fieldsContainer}>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('payment.cardNumber')}
            value={cardNumber}
            onChangeText={formatCardNumber}
            keyboardType="numeric"
            maxLength={19}
            placeholderTextColor={colors.text.secondary}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder={i18n.t('payment.expiryMonth')}
              value={expiryMonth}
              onChangeText={(text) => setExpiryMonth(text.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="numeric"
              maxLength={2}
              placeholderTextColor={colors.text.secondary}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder={i18n.t('payment.expiryYear')}
              value={expiryYear}
              onChangeText={(text) => setExpiryYear(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="numeric"
              maxLength={4}
              placeholderTextColor={colors.text.secondary}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('payment.cardholderName')}
            value={cardholderName}
            onChangeText={setCardholderName}
            autoCapitalize="words"
            placeholderTextColor={colors.text.secondary}
          />
          <TextInput
            style={styles.input}
            placeholder="CVV"
            value={cvv}
            onChangeText={(text) => setCvv(text.replace(/[^0-9]/g, '').slice(0, 4))}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            placeholderTextColor={colors.text.secondary}
          />
        </View>
      );
    } else if (methodType === 'paypal') {
      return (
        <View style={styles.fieldsContainer}>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('auth.email')}
            value={paypalEmail}
            onChangeText={setPaypalEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.text.secondary}
          />
        </View>
      );
    }

    return (
      <View style={styles.fieldsContainer}>
        <Text style={styles.noteText}>
          {i18n.t('payment.walletSetupNote')}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingMethod ? i18n.t('payment.editPaymentMethod') : i18n.t('payment.addPaymentMethod')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderPaymentTypeSelector()}
          {renderPaymentFields()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              resetForm();
              onClose();
            }}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              {i18n.t('common.cancel')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.saveButtonText]}>
              {loading ? i18n.t('common.loading') : (editingMethod ? i18n.t('common.update') : i18n.t('common.add'))}
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
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
