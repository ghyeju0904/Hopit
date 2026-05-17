import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/tokens';

/**
 * HOP 화면 공통 컨테이너
 *
 * 기본 배경 + 패딩 + 옵션으로 스크롤 제공
 *
 * Props:
 * - scroll: true면 ScrollView, false면 View
 * - center: true면 콘텐츠를 세로 중앙 정렬
 */
const HopScreen = ({
  scroll = true,
  center = false,
  style,
  contentContainerStyle,
  children
}) => {
  if (scroll) {
    return (
      <ScrollView
        style={[styles.container, style]}
        contentContainerStyle={[
          styles.content,
          center && styles.centerContent,
          contentContainerStyle
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        styles.content,
        center && styles.centerContent,
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bgWhite
  },
  content: {
    padding: spacing.md
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center'
  }
});

export default HopScreen;
