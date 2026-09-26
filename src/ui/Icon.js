import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from './theme';
const paths = {
  flask:
    'M9 3h6M10 3v7L5 18a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-8V3M8 15h8',
  history: 'M4 5v5h5M4 10a8 8 0 1 1 1 7M12 7v5l3 2',
  book: 'M12 6v15M12 6C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-4-1-7-1-10 2',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  check: 'm5 12 4 4L19 6',
  save: 'M5 3h12l3 3v15H4V3h1m3 0v6h8V3M8 21v-7h8v7',
  search: 'm16 16 5 5M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14',
  close: 'm6 6 12 12M6 18 18 6',
  info: 'M12 11v6M12 7h.01',
};
export function Icon({ name, color = colors.ink, size = 22 }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessible={false}
    >
      {name === 'info' && (
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.7" />
      )}
      <Path
        d={paths[name]}
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
/** Abstract brand illustration, not a rendering of the user's molecular structure. */
export function MoleculeMark({ size = 110 }) {
  return (
    <Svg
      width={size * 0.91}
      height={size}
      viewBox="0 0 100 110"
      accessible={false}
    >
      <Path
        d="M49 13 79 30v35L49 83 19 65V30L49 13M49 83v20M79 30 95 21M19 65 4 74M26 35v24M49 22l23 13M72 60 49 74"
        stroke="#A5C2A8"
        strokeWidth="1.3"
        fill="none"
      />
      <Circle cx="49" cy="13" r="5" fill={colors.gold} />
      <Circle cx="79" cy="65" r="5" fill="#DDE8DD" />
      <Circle cx="19" cy="65" r="5" fill={colors.gold} />
      <Circle cx="49" cy="103" r="3" fill="#A5C2A8" />
    </Svg>
  );
}
