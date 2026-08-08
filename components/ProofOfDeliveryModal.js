import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  ScrollView,
} from 'react-native';
import { Button } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { colors } from '../global';
import i18n from '../i18n';
import SignaturePad from './SignaturePad';
import apiClient from '../api';
import { config, PUBLIC_UPLOAD_FOLDERS } from '../config';
import { useDriver } from '../contexts/DriverContext';

const GEOFENCE_HINT_M = 150;

export default function ProofOfDeliveryModal({
  visible,
  orderId,
  onClose,
  onCompleted,
}) {
  const { updateDeliveryStatus } = useDriver();
  const [photoAsset, setPhotoAsset] = useState(null);
  const [signatureData, setSignatureData] = useState('');
  const [signatureKey, setSignatureKey] = useState(0);
  const [contactless, setContactless] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError(i18n.t('logistics.photoRequired'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setPhotoAsset(result.assets[0]);
      setError('');
    }
  };

  const clearSignature = () => {
    setSignatureData('');
    setSignatureKey((k) => k + 1);
  };

  const submit = async () => {
    if (contactless && !photoAsset) {
      setError(i18n.t('logistics.photoRequired'));
      return;
    }
    if (!signatureData) {
      setError(i18n.t('logistics.signatureRequired'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (config.DEMO_MODE) {
        await updateDeliveryStatus(orderId, 'delivered');
        setPhotoAsset(null);
        clearSignature();
        if (onCompleted) onCompleted({ _id: orderId, status: 'delivered' });
        onClose();
        return;
      }

      let photoUrl = null;
      if (photoAsset) {
        photoUrl = await apiClient.uploadPublicFile(
          photoAsset,
          PUBLIC_UPLOAD_FOLDERS.AVATARS
        );
      }

      let lat;
      let lng;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        }
      } catch {
        // soft: backend accepts missing coords
      }

      const order = await apiClient.completeDeliveryWithProof(orderId, {
        photoUrl,
        signatureData,
        lat,
        lng,
        contactless,
      });
      setPhotoAsset(null);
      clearSignature();
      if (onCompleted) onCompleted(order);
      onClose();
    } catch (e) {
      setError(e?.message || i18n.t('logistics.completeError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>{i18n.t('logistics.podTitle')}</Text>
            <Text style={styles.sub}>{i18n.t('logistics.podSubtitle')}</Text>

            <View style={styles.row}>
              <Text style={styles.label}>{i18n.t('logistics.contactless')}</Text>
              <Switch value={contactless} onValueChange={setContactless} />
            </View>

            <Text style={styles.hint}>
              {i18n.t('logistics.geofenceHint', { meters: GEOFENCE_HINT_M })}
            </Text>

            {photoAsset ? (
              <Image source={{ uri: photoAsset.uri }} style={styles.photo} />
            ) : null}

            <Button
              title={
                photoAsset
                  ? i18n.t('logistics.retakePhoto')
                  : i18n.t('logistics.takePhoto')
              }
              onPress={takePhoto}
              buttonStyle={styles.secondaryBtn}
              disabled={loading}
            />

            <Text style={styles.label}>{i18n.t('logistics.signHere')}</Text>
            <SignaturePad key={signatureKey} onChange={setSignatureData} />
            <TouchableOpacity onPress={clearSignature} disabled={loading}>
              <Text style={styles.clear}>{i18n.t('logistics.clearSignature')}</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.hint}>{i18n.t('logistics.uploading')}</Text>
              </View>
            ) : null}

            <Button
              title={i18n.t('logistics.submit')}
              onPress={submit}
              loading={loading}
              buttonStyle={styles.primaryBtn}
              testID="pod-submit"
            />
            <Button
              title={i18n.t('common.cancel')}
              type="clear"
              onPress={onClose}
              disabled={loading}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 20,
  },
  content: {
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text?.primary || '#111',
  },
  sub: {
    fontSize: 13,
    color: colors.text?.secondary || '#666',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text?.primary || '#222',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#777',
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  clear: {
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'right',
  },
  error: {
    color: '#c62828',
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: colors.success || colors.primary,
    borderRadius: 10,
    marginTop: 8,
  },
  secondaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
});
