import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  spacing,
  borderRadius,
  typography,
  componentThemes
} from '../theme/tokens';

/**
 * HOP 픽셀 아트 버튼 컴포넌트
 * 디자인 시스템 예시
 */
const HopButton = ({
  title,
  variant = 'primary', // 'primary' | 'secondary' | 'disabled'
  size = 'md',          // 'sm' | 'md' | 'lg'
  onPress,
  disabled = false,
  style,
  ...props
}) => {
  const theme = componentThemes.button[disabled ? 'disabled' : variant];

  const styles = StyleSheet.create({
    button: {
      width: '100%',
      height: theme.height,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
      backgroundColor: theme.bg,
      borderRadius: borderRadius.xs, // 픽셀 스타일은 매우 작은 라운딩
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 0,
      elevation: 3, // Android shadow
      marginVertical: spacing.sm
    },

    text: {
      fontSize: typography.fontSize.button,
      fontWeight: String(typography.fontWeight.bold),
      color: theme.text,
      textAlign: 'center'
    }
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      {...props}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default HopButton;
