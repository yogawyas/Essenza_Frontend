import React, { memo } from 'react';
import { SvgXml } from 'react-native-svg';
import * as artwork from './designArtwork';

export const DesignArt = memo(function DesignArt({
  name,
  crop,
  width,
  height,
}) {
  return (
    <SvgXml
      xml={artwork[name]}
      width={width}
      height={height}
      {...(crop ? { viewBox: crop } : {})}
      accessible={false}
    />
  );
});
