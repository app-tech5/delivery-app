import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Card } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../global';
import i18n from '../i18n';
import {
  getDocumentLabel,
  getDocumentStatusColor,
  getDocumentStatusLabel,
  normalizeDocType,
} from '../utils/documentUtils';

function ProfileDocumentRow({
  doc,
  uploadingDocType,
  onUpload,
}) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.label}>{getDocumentLabel(doc.type)}</Text>
        {doc.fileUrl ? (
          <TouchableOpacity onPress={() => Linking.openURL(doc.fileUrl)}>
            <Text style={styles.link}>{i18n.t('viewDocument')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {doc.status ? (
        <View
          style={[
            styles.statusPill,
            { backgroundColor: `${getDocumentStatusColor(doc.status)}20` },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getDocumentStatusColor(doc.status) }]}
          >
            {getDocumentStatusLabel(doc.status)}
          </Text>
        </View>
      ) : doc.canUpload ? (
        <TouchableOpacity
          style={styles.uploadAction}
          onPress={() => onUpload(doc.type)}
          disabled={!!uploadingDocType}
        >
          {uploadingDocType === doc.type ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <MaterialIcons name="cloud-upload" size={18} color={colors.primary} />
              <Text style={styles.uploadText}>{i18n.t('profile.uploadDocument')}</Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function ProfileDocumentsCard({
  documents,
  uploadingDocType,
  customDocType,
  onCustomDocTypeChange,
  onUpload,
}) {
  const normalizedCustomType = normalizeDocType(customDocType);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{i18n.t('profile.documents')}</Text>
      <Card containerStyle={styles.card}>
        {documents.map((doc) => (
          <ProfileDocumentRow
            key={doc.type}
            doc={doc}
            uploadingDocType={uploadingDocType}
            onUpload={onUpload}
          />
        ))}

        <View style={[styles.row, styles.rowLast, styles.customRow]}>
          <TextInput
            style={styles.customInput}
            placeholder={i18n.t('profile.documentTypePlaceholder')}
            placeholderTextColor={colors.text.secondary}
            value={customDocType}
            onChangeText={onCustomDocTypeChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.uploadAction}
            onPress={() => onUpload(customDocType)}
            disabled={!!uploadingDocType || !customDocType.trim()}
          >
            {uploadingDocType === normalizedCustomType ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <MaterialIcons name="cloud-upload" size={18} color={colors.primary} />
                <Text style={styles.uploadText}>{i18n.t('profile.uploadDocument')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  link: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  uploadAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  customRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  customInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
});
