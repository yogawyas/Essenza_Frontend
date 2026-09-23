import React from 'react';
import { View, StyleSheet } from 'react-native';

// Home icon — house shape using Views
export const HomeIcon = ({ color, size = 24 }) => (
  <View style={[iconStyles.container, { width: size, height: size }]}>
    {/* Roof */}
    <View style={[iconStyles.roof, {
      borderLeftWidth: size * 0.52,
      borderRightWidth: size * 0.52,
      borderBottomWidth: size * 0.44,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: color,
      top: 0,
    }]} />
    {/* Wall */}
    <View style={[iconStyles.wall, {
      width: size * 0.58,
      height: size * 0.44,
      backgroundColor: color,
      borderRadius: 1,
      bottom: 0,
    }]} />
    {/* Door */}
    <View style={[iconStyles.door, {
      width: size * 0.18,
      height: size * 0.26,
      backgroundColor: 'transparent',
      borderWidth: size * 0.045,
      borderColor: color === '#D4AF37' ? '#0F2B20' : '#F8F6EE',
      borderRadius: 1,
      bottom: 0,
    }]} />
  </View>
);

// Wardrobe icon — cabinet/armoire shape
export const WardrobeIcon = ({ color, size = 24 }) => {
  const borderC = color === '#D4AF37' ? '#0F2B20' : '#F8F6EE';
  return (
    <View style={[iconStyles.container, { width: size, height: size }]}>
      {/* Cabinet body */}
      <View style={{
        width: size * 0.84,
        height: size * 0.78,
        borderWidth: size * 0.07,
        borderColor: color,
        borderRadius: size * 0.08,
        position: 'absolute',
        bottom: size * 0.06,
        flexDirection: 'row',
        overflow: 'hidden',
      }}>
        {/* Center divider */}
        <View style={{
          position: 'absolute',
          left: '50%',
          top: 0, bottom: 0,
          width: size * 0.07,
          backgroundColor: color,
          marginLeft: -(size * 0.035),
        }} />
        {/* Left knob */}
        <View style={{
          position: 'absolute',
          left: '25%',
          top: '50%',
          width: size * 0.1,
          height: size * 0.1,
          borderRadius: size * 0.05,
          backgroundColor: color,
          marginLeft: -(size * 0.05),
          marginTop: -(size * 0.05),
        }} />
        {/* Right knob */}
        <View style={{
          position: 'absolute',
          left: '75%',
          top: '50%',
          width: size * 0.1,
          height: size * 0.1,
          borderRadius: size * 0.05,
          backgroundColor: color,
          marginLeft: -(size * 0.05),
          marginTop: -(size * 0.05),
        }} />
      </View>
      {/* Top bar / cornice */}
      <View style={{
        position: 'absolute',
        top: size * 0.06,
        width: size * 0.9,
        height: size * 0.12,
        backgroundColor: color,
        borderRadius: size * 0.04,
      }} />
      {/* Legs */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: size * 0.14,
        width: size * 0.1,
        height: size * 0.08,
        backgroundColor: color,
        borderRadius: 1,
      }} />
      <View style={{
        position: 'absolute',
        bottom: 0,
        right: size * 0.14,
        width: size * 0.1,
        height: size * 0.08,
        backgroundColor: color,
        borderRadius: 1,
      }} />
    </View>
  );
};

const iconStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  roof: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  wall: {
    position: 'absolute',
    alignSelf: 'center',
  },
  door: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 0,
  },
});
