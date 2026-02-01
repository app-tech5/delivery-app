import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { CONTACT_ACTIONS } from '../utils/supportData';

const ContactActions = ({ onContactAction }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{i18n.t('support.contact')}</Text>
      <Text style={styles.sectionSubtitle}>{i18n.t('support.responseTime')}: &lt; 2h</Text>

      {CONTACT_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.id}
          onPress={() => onContactAction(action.actionType)}
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
      ))}
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
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
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
