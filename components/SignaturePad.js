import React, { useMemo, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

export default function SignaturePad({ height = 160, strokeColor = '#111', onChange }) {
  const [paths, setPaths] = useState([]);
  const current = useRef('');
  const committed = useRef([]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          current.current = `M${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          current.current += ` L${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
          setPaths([...committed.current, current.current]);
        },
        onPanResponderRelease: () => {
          if (!current.current) return;
          committed.current = [...committed.current, current.current];
          current.current = '';
          setPaths(committed.current);
          if (onChange) onChange(committed.current.join('|'));
        },
      }),
    [onChange]
  );

  return (
    <View style={[styles.wrap, { height }]} {...pan.panHandlers}>
      <Svg width="100%" height="100%">
        {paths.map((d, i) => (
          <Path
            key={`p-${i}`}
            d={d}
            stroke={strokeColor}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: Math.min(SCREEN_W - 48, 420),
    alignSelf: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
