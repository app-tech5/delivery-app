import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { FAQ_DATA } from '../utils/supportData';

const FAQSection = ({ expandedFAQ, onToggleFAQ }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{i18n.t('support.faq')}</Text>

      {FAQ_DATA.map((faq) => (
        <Card key={faq.id} containerStyle={styles.faqCard}>
          <TouchableOpacity
            onPress={() => onToggleFAQ(faq.id)}
            style={styles.faqHeader}
          >
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            <Icon
              name={expandedFAQ === faq.id ? 'expand-less' : 'expand-more'}
              type="material"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>

          {expandedFAQ === faq.id && (
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          )}
        </Card>
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
  faqCard: {
    borderRadius: 12,
    padding: 0,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
  },
});

export default FAQSection;
