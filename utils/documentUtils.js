import i18n from '../i18n';
import { colors } from '../global';
import { DOCUMENT_TYPES } from '../config';

export const normalizeDocType = (value) =>
  value.trim().toLowerCase().replace(/\s+/g, '_');

export const getDocumentLabel = (type) =>
  i18n.t(type, { defaultValue: type.replace(/_/g, ' ') });

export const buildDriverDocuments = (driver) => {
  const uploadedTypes = (driver?.documents || []).map((doc) => doc.type);
  const documentTypes = [...new Set([...DOCUMENT_TYPES, ...uploadedTypes])];

  return documentTypes.map((type) => {
    const uploaded = (driver?.documents || []).find((doc) => doc.type === type);
    return {
      type,
      fileUrl: uploaded?.fileUrl,
      canUpload: DOCUMENT_TYPES.includes(type),
      status: uploaded?.fileUrl
        ? (driver?.isApproved ? 'verified' : 'pending')
        : null,
    };
  });
};

export const getDocumentStatusColor = (status) => {
  switch (status) {
    case 'verified': return colors.success;
    case 'pending': return colors.warning;
    case 'rejected': return colors.error;
    default: return colors.text.secondary;
  }
};

export const getDocumentStatusLabel = (status) => {
  switch (status) {
    case 'verified': return i18n.t('profile.verified');
    case 'pending': return i18n.t('profile.pending');
    case 'rejected': return i18n.t('profile.rejected');
    default: return status;
  }
};
