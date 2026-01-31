import React from 'react';
import { View, Text } from 'react-native';
import { formatDate } from '../utils';
import { timelineStyles } from '../styles/timelineStyles';
import i18n from '../i18n';

const DateGroupHeader = ({ date, count, totalEarnings }) => {
  return (
    <View style={timelineStyles.dateHeader}>
      <View style={timelineStyles.dateLine} />
      <View style={timelineStyles.dateContent}>
        <Text style={timelineStyles.dateText}>{formatDate(date)}</Text>
        <View style={timelineStyles.dateStats}>
          <Text style={timelineStyles.dateDeliveries}>
            {count} {count === 1 ? i18n.t('reports.deliverySingular') : i18n.t('reports.deliveryPlural')}
          </Text>
          <Text style={timelineStyles.dateEarnings}>{totalEarnings}</Text>
        </View>
      </View>
      <View style={timelineStyles.dateLine} />
    </View>
  );
};

export default DateGroupHeader;
