import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { s } from './theme';

export function ListEntry({ list, navigation }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => navigation.navigate('List', { id: list.id })}
      style={[s.between, { minHeight: 58, paddingHorizontal: 8 }]}
    >
      <View style={s.flex}>
        <Text style={s.h3} numberOfLines={2}>
          {list.title}
        </Text>
        <Text style={s.small}>{list.items.length} Parfum · Koleksi</Text>
      </View>
      <Text style={s.h3}>›</Text>
    </Pressable>
  );
}
