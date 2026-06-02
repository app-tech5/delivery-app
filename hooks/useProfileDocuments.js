import { useState } from 'react';
import { Alert } from 'react-native';
import apiClient from '../api';
import i18n from '../i18n';
import { pickDriverDocument } from '../utils/pickDriverFile';
import { normalizeDocType } from '../utils/documentUtils';

export function useProfileDocuments(driver, setDriver) {
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [customDocType, setCustomDocType] = useState('');

  const uploadDocument = async (rawDocType) => {
    const docType = normalizeDocType(rawDocType);

    if (!docType) {
      Alert.alert(i18n.t('profile.documentTypeRequired'));
      return;
    }

    if ((driver?.documents || []).some((doc) => doc.type === docType)) {
      Alert.alert(i18n.t('profile.documentAlreadyAdded'));
      return;
    }

    try {
      const asset = await pickDriverDocument();
      if (!asset) return;

      setUploadingDocType(docType);
      const updatedDriver = await apiClient.uploadDriverDocument(docType, asset);
      setDriver(updatedDriver);
      setCustomDocType('');
      Alert.alert(i18n.t('profile.uploadSuccess'));
    } catch (error) {
      console.error('Document upload error:', error);
      Alert.alert(
        error.message === 'Document already added'
          ? i18n.t('profile.documentAlreadyAdded')
          : i18n.t('profile.uploadError')
      );
    } finally {
      setUploadingDocType(null);
    }
  };

  return {
    uploadingDocType,
    customDocType,
    setCustomDocType,
    uploadDocument,
  };
}
