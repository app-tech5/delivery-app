import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { colors } from '../global';
import { getRatingColor } from '../utils';

const { width } = Dimensions.get('window');

const EnhancedStatCard = ({
  value,
  label,
  icon,
  backgroundColor,
  trend,
  stars,
  style
}) => {
  return (
    <Card containerStyle={[
      styles.statCard,
      { backgroundColor },
      style
    ]}>
      {/* Icône principale */}
      <View style={styles.statIcon}>
        <Icon
          name={icon.name}
          type={icon.type || 'material'}
          size={24}
          color={colors.white}
        />
      </View>

      {/* Contenu principal */}
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>

      {/* Indicateur de tendance (optionnel) */}
      {trend && (
        <View style={styles.trendContainer}>
          <Icon
            name={trend.name}
            type="material"
            size={16}
            color={colors.white}
          />
        </View>
      )}

      {/* Étoiles pour la note (optionnel) */}
      {stars && (
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              name={star <= Math.floor(stars) ? 'star' : 'star-border'}
              type="material"
              size={12}
              color={colors.white}
            />
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = {
  statCard: {
    width: (width - 48) / 2, // 2 cards per row with margins
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 0,
  },
  statIcon: {
    marginBottom: 12,
  },
  statContent: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
  },
  trendContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  ratingStars: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
  },
};

export default EnhancedStatCard;
