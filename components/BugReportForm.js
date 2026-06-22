import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Card } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { getBugCategories, getBugPriorities } from '../utils/supportUtils';

const INITIAL_CATEGORY = 'general';
const INITIAL_PRIORITY = 'normal';

const DescriptionSubmit = React.memo(({ category, priority, submitting, resetKey, onSubmit }) => {
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (resetKey > 0) {
      setDescription('');
    }
  }, [resetKey]);

  const canSubmit = description.trim().length > 0 && !submitting;

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }
    onSubmit({ category, priority, description });
  };

  return (
    <>
      <TextInput
        testID="support-bug-description"
        placeholder={i18n.t('support.issuePlaceholder')}
        placeholderTextColor={colors.text.secondary}
        multiline
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
        style={styles.descriptionInput}
        editable={!submitting}
      />

      <Pressable
        testID="support-send-report"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit, busy: submitting }}
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          !canSubmit && styles.submitButtonDisabled,
          pressed && canSubmit && styles.submitButtonPressed,
        ]}
      >
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={[styles.submitButtonText, !canSubmit && styles.submitButtonTextDisabled]}>
            {i18n.t('support.sendReport')}
          </Text>
        )}
      </Pressable>
    </>
  );
});

DescriptionSubmit.displayName = 'DescriptionSubmit';

const BugReportForm = ({ onSubmit, submitting, resetKey = 0 }) => {
  const [category, setCategory] = useState(INITIAL_CATEGORY);
  const [priority, setPriority] = useState(INITIAL_PRIORITY);

  useEffect(() => {
    if (resetKey > 0) {
      setCategory(INITIAL_CATEGORY);
      setPriority(INITIAL_PRIORITY);
    }
  }, [resetKey]);

  const bugCategories = useMemo(() => getBugCategories(), []);
  const bugPriorities = useMemo(() => getBugPriorities(), []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{i18n.t('support.bugReport')}</Text>

      <Card containerStyle={styles.bugReportCard}>
        <Text style={styles.bugReportTitle}>{i18n.t('support.describeIssue')}</Text>

        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>{i18n.t('support.category')}</Text>
          <View style={styles.selectorButtons}>
            {bugCategories.map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => setCategory(item.key)}
                style={[
                  styles.selectorButton,
                  category === item.key && styles.selectorButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.selectorButtonText,
                    category === item.key && styles.selectorButtonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>{i18n.t('support.priority')}</Text>
          <View style={styles.selectorButtons}>
            {bugPriorities.map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => setPriority(item.key)}
                style={[
                  styles.selectorButton,
                  styles.priorityButton,
                  priority === item.key && [
                    styles.selectorButtonActive,
                    { borderColor: item.color },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.selectorButtonText,
                    priority === item.key && styles.selectorButtonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <DescriptionSubmit
          category={category}
          priority={priority}
          submitting={submitting}
          resetKey={resetKey}
          onSubmit={onSubmit}
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
    borderWidth: 1,
    borderColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 100,
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  submitButtonDisabled: {
    backgroundColor: colors.background.secondary,
    opacity: 0.85,
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: colors.text.secondary,
  },
});

export default React.memo(BugReportForm);
