import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useDriver } from '../contexts/DriverContext';
import i18n from '../i18n';
import apiClient from '../api';
import { config } from '../config';

export const useDeliveryActions = () => {
  const { updateDeliveryStatus, acceptDelivery, loadDriverOrders, driver } = useDriver();
  const [loading, setLoading] = useState(false);
  const [podOrderId, setPodOrderId] = useState(null);

  const handleStatusChange = async (orderId, newStatus, confirmMessage) => {
    Alert.alert(i18n.t('reports.changeStatusTitle', 'Change Status'), confirmMessage, [
      { text: i18n.t('common.cancel'), style: 'cancel' },
      {
        text: i18n.t('common.confirm'),
        onPress: async () => {
          setLoading(true);
          try {
            await updateDeliveryStatus(orderId, newStatus);
            Alert.alert(i18n.t('common.success', 'Success'), i18n.t('reports.updateSuccess'));
          } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            Alert.alert(i18n.t('common.error', 'Error'), i18n.t('reports.updateError'));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
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
              if (config.DEMO_MODE) {
                await acceptDelivery(orderId);
              } else {
                const result = await apiClient.acceptOrderBatch(orderId, {
                  includeNearby: true,
                });
                await loadDriverOrders?.();
                const extra = Number(result?.nearbyAdded || 0);
                Alert.alert(
                  i18n.t('common.success', 'Success'),
                  extra > 0
                    ? i18n.t('logistics.batchAccepted', { count: extra })
                    : i18n.t('reports.acceptSuccess')
                );
                return;
              }
              Alert.alert(i18n.t('common.success', 'Success'), i18n.t('reports.acceptSuccess'));
            } catch (error) {
              console.error("Erreur lors de l'acceptation:", error);
              Alert.alert(i18n.t('common.error', 'Error'), i18n.t('reports.acceptError'));
            } finally {
              setLoading(false);
            }
          },
        },
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

  const handleMarkDelivered = useCallback((orderId) => {
    setPodOrderId(orderId);
  }, []);

  const closePodModal = useCallback(() => setPodOrderId(null), []);

  const onPodCompleted = useCallback(async () => {
    setPodOrderId(null);
    if (driver?._id) {
      await loadDriverOrders?.();
    }
  }, [driver?._id, loadDriverOrders]);

  return {
    loading,
    handleAcceptDelivery,
    handleStartDelivery,
    handleMarkDelivered,
    handleStatusChange,
    markAsDelivered: handleMarkDelivered,
    podOrderId,
    closePodModal,
    onPodCompleted,
  };
};
