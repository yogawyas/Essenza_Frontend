import React, { useState } from 'react';
import { Image } from 'react-native';
import { bottlePhotos } from '../domain/fragranceMedia';

export function BottlePhoto({ fragrance, size, children }) {
  const source = bottlePhotos[fragrance.id];
  const [failedId, setFailedId] = useState(null);
  if (!source || failedId === fragrance.id) {
    return children;
  }
  return (
    <Image
      accessibilityLabel={
        fragrance.brand + ' ' + fragrance.name + ' ' + fragrance.concentration
      }
      source={source}
      resizeMode="contain"
      style={{ width: size, height: size * 1.28 }}
      onError={() => setFailedId(fragrance.id)}
    />
  );
}
