import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../global';
import i18n from '../i18n';

const PeriodSelector = ({ periods, activePeriod, onPeriodChange }) => {
  return (
    <View style={styles.periodSelector}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.periodScroll}
      >
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            onPress={() => onPeriodChange(period.key)}
            style={[
              styles.periodButton,
              activePeriod === period.key && styles.periodButtonActive
            ]}
          >
            <Text style={[
              styles.periodText,
              activePeriod === period.key && styles.periodTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  periodSelector: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  periodScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  periodButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  periodTextActive: {
    color: colors.white,
  },
});

export default PeriodSelector;


