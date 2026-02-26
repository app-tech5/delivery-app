import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';
import { colors } from '../global';

const StatItem = ({ value, label, valueStyle, labelStyle, containerStyle }) => (
  <View style={[styles.statItem, containerStyle]}>
    <Text style={[styles.statValue, valueStyle]}>{value}</Text>
    <Text style={[styles.statLabel, labelStyle]}>{label}</Text>
  </View>
);

const StatsGrid = ({
  stats,
  containerStyle,
  cardStyle,
  gridStyle,
  statStyle,
  valueStyle,
  labelStyle
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Card containerStyle={[styles.card, cardStyle]}>
        <View style={[styles.grid, gridStyle]}>
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              value={stat.value}
              label={stat.label}
              valueStyle={[valueStyle, stat.valueStyle]}
              labelStyle={[labelStyle, stat.labelStyle]}
              containerStyle={[statStyle, stat.containerStyle]}
            />
          ))}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default StatsGrid;
export { StatItem };


