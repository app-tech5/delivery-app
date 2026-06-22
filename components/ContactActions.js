import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

const ContactActions = ({ contactActions, loading, onContactAction }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{i18n.t('support.contact')}</Text>
      <Text style={styles.sectionSubtitle}>
        {i18n.t('support.responseTime')}: {i18n.t('support.responseTimeUnder2h')}
      </Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : contactActions.length > 0 ? (
        contactActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => onContactAction(action)}
            style={styles.contactCard}
          >
            <View style={[styles.contactIcon, { backgroundColor: action.color }]}>
              <Icon name={action.icon} type="material" size={24} color={colors.white} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>{action.title}</Text>
              <Text style={styles.contactSubtitle}>{action.subtitle}</Text>
            </View>
            <Icon name="chevron-right" type="material" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyText}>{i18n.t('support.contactUnavailable')}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  loader: {
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default ContactActions;
