import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { colors } from '../global';

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconType = 'material',
  color = colors.primary,
  trend,
  trendValue,
  style
}) {
  return (
    <Card containerStyle={[styles.card, { backgroundColor: color }, style]}>
      <View style={styles.iconContainer}>
        <Icon name={icon} type={iconType} size={24} color={colors.white} />
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {trend && trendValue && (
          <View style={styles.trendContainer}>
            <Icon
              name={trend.icon}
              type={trend.type || 'material'}
              size={14}
              color={trend.color}
            />
            <Text style={[styles.trendText, { color: trend.color }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    margin: 0,
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: colors.white,
    opacity: 0.7,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 10,
    marginLeft: 4,
    opacity: 0.9,
  },
});


