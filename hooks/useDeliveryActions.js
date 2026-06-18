import { useState } from 'react';
import { Alert } from 'react-native';
import { useDriver } from '../contexts/DriverContext';
import i18n from '../i18n';

export const useDeliveryActions = () => {
  const { updateDeliveryStatus, acceptDelivery } = useDriver();
  const [loading, setLoading] = useState(false);
  
  const handleStatusChange = async (orderId, newStatus, confirmMessage) => {
    Alert.alert(
      'Change Status',
      confirmMessage,
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.confirm'),
          onPress: async () => {
            setLoading(true);
            try {
              await updateDeliveryStatus(orderId, newStatus);
              Alert.alert('Success', i18n.t('reports.updateSuccess'));
            } catch (error) {
              console.error('Erreur lors de la mise à jour:', error);
              Alert.alert('Error', i18n.t('reports.updateError'));
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const handleAcceptDelivery = async (orderId) => {
    Alert.alert(
      i18n.t('reports.acceptDeliveryTitle'),
      i18n.t('reports.acceptDeliveryConfirm'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.confirm'),
          onPress: async () => {
            setLoading(true);
            try {
              await acceptDelivery(orderId);
              Alert.alert('Success', i18n.t('reports.acceptSuccess'));
            } catch (error) {
              console.error('Erreur lors de l\'acceptation:', error);
              Alert.alert('Error', i18n.t('reports.acceptError'));
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const handleStartDelivery = (orderId) => {
    handleStatusChange(
      orderId,
      'out_for_delivery',
      i18n.t('reports.startDeliveryConfirm')
    );
  };
  
  const handleMarkDelivered = (orderId) => {
    handleStatusChange(
      orderId,
      'delivered',
      i18n.t('reports.completeDeliveryConfirm')
    );
  };

  return {
    loading,
    handleAcceptDelivery,
    handleStartDelivery,
    handleMarkDelivered,
    handleStatusChange
  };
};
