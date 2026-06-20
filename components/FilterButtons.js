import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';

const FilterButtons = ({
  filters,
  activeFilter,
  onFilterPress,
  containerStyle,
  scrollStyle,
  buttonStyle,
  activeButtonStyle,
  textStyle,
  activeTextStyle,
  iconType = 'material-community'
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, scrollStyle]}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => onFilterPress(filter.key)}
            style={[
              styles.filterButton,
              buttonStyle,
              activeFilter === filter.key && [styles.filterButtonActive, activeButtonStyle]
            ]}
          >
            <View style={styles.iconWrapper}>
              <Icon
                name={filter.icon}
                type={filter.iconType || iconType}
                size={18}
                color={activeFilter === filter.key ? colors.white : colors.primary}
                testID={`filter-icon-${filter.key}`}
              />
            </View>
            <Text
              style={[
                styles.filterText,
                textStyle,
                activeFilter === filter.key && [styles.filterTextActive, activeTextStyle]
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  iconWrapper: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 6,
    includeFontPadding: false,
    lineHeight: 18,
    textAlignVertical: 'center',
  },
  filterTextActive: {
    color: colors.white,
  },
});

export default FilterButtons;

