import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Button, Input } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { BUG_CATEGORIES, BUG_PRIORITIES } from '../utils/supportData';

const BugReportForm = ({ bugReport, setBugReport, onSubmit }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{i18n.t('support.bugReport')}</Text>

      <Card containerStyle={styles.bugReportCard}>
        <Text style={styles.bugReportTitle}>{i18n.t('support.describeIssue')}</Text>

        {/* Sélecteur de catégorie */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>{i18n.t('support.category')}</Text>
          <View style={styles.selectorButtons}>
            {BUG_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                onPress={() => setBugReport(prev => ({ ...prev, category: category.key }))}
                style={[
                  styles.selectorButton,
                  bugReport.category === category.key && styles.selectorButtonActive
                ]}
              >
                <Text style={[
                  styles.selectorButtonText,
                  bugReport.category === category.key && styles.selectorButtonTextActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sélecteur de priorité */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>{i18n.t('support.priority')}</Text>
          <View style={styles.selectorButtons}>
            {BUG_PRIORITIES.map((priority) => (
              <TouchableOpacity
                key={priority.key}
                onPress={() => setBugReport(prev => ({ ...prev, priority: priority.key }))}
                style={[
                  styles.selectorButton,
                  styles.priorityButton,
                  bugReport.priority === priority.key && [
                    styles.selectorButtonActive,
                    { borderColor: priority.color }
                  ]
                ]}
              >
                <Text style={[
                  styles.selectorButtonText,
                  bugReport.priority === priority.key && styles.selectorButtonTextActive
                ]}>
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Zone de description */}
        <Input
          placeholder={i18n.t('support.issuePlaceholder')}
          multiline
          numberOfLines={4}
          value={bugReport.description}
          onChangeText={(text) => setBugReport(prev => ({ ...prev, description: text }))}
          containerStyle={styles.descriptionInput}
          inputContainerStyle={styles.descriptionInputContainer}
          inputStyle={styles.descriptionInputText}
        />

        <Button
          title={i18n.t('support.sendReport')}
          onPress={onSubmit}
          buttonStyle={styles.submitButton}
          disabled={!bugReport.description.trim()}
        />
      </Card>
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
  bugReportCard: {
    borderRadius: 12,
    padding: 16,
  },
  bugReportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  selectorContainer: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  selectorButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectorButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  priorityButton: {
    borderColor: colors.text.secondary,
  },
  selectorButtonActive: {
    backgroundColor: colors.primary,
  },
  selectorButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  selectorButtonTextActive: {
    color: colors.white,
  },
  descriptionInput: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  descriptionInputContainer: {
    borderWidth: 1,
    borderColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 100,
  },
  descriptionInputText: {
    fontSize: 14,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
});

export default BugReportForm;
