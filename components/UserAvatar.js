import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';
import { resolveUploadUrl } from '../utils/imageUtils';

export default function UserAvatar({
  uri,
  name,
  size = 100,
  editable = false,
  onEditPress,
  style,
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  const resolvedUri = resolveUploadUrl(uri);
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const showImage = resolvedUri && !loadFailed;
  const radius = size / 2;
  const editButtonSize = Math.round(size * 0.4);

  useEffect(() => {
    setLoadFailed(false);
  }, [uri]);

  return (
    <View style={[styles.container, style]}>
      {showImage ? (
        <Image
          source={{ uri: resolvedUri }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: radius },
          ]}
          // onError={() => setLoadFailed(true)}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: radius },
          ]}
        >
          <Text style={[styles.initial, { fontSize: size * 0.36 }]}>{initial}</Text>
        </View>
      )}

      {editable && onEditPress ? (
        <TouchableOpacity
          style={[
            styles.editButton,
            {
              width: editButtonSize,
              height: editButtonSize,
              borderRadius: editButtonSize / 2,
            },
          ]}
          onPress={onEditPress}
        >
          <Icon name="camera" type="material" size={16} color={colors.white} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderWidth: 4,
    borderColor: colors.primary,
  },
  placeholder: {
    borderWidth: 4,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: 'bold',
    color: colors.white,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
});
