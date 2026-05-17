import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import { RabbitSprite } from './PixelSprites';

/**
 * 점프하는 토끼
 *
 * Props:
 * - size: 스프라이트 크기 (기본 64)
 * - jumpHeight: 점프 높이 px (기본 12)
 * - duration: 1회 점프 시간 ms (기본 800)
 * - autoPlay: 자동 반복 (기본 true)
 * - trigger: 값이 바뀔 때마다 1회 점프 (autoPlay false일 때 사용)
 */
const JumpingRabbit = ({
  size = 64,
  jumpHeight = 12,
  duration = 800,
  autoPlay = true,
  trigger,
  style
}) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop;
    if (autoPlay) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -jumpHeight,
            duration: duration / 2,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: duration / 2,
            easing: Easing.bounce,
            useNativeDriver: true
          }),
          Animated.delay(600)
        ])
      );
      loop.start();
    }
    return () => loop?.stop?.();
  }, [autoPlay, jumpHeight, duration, translateY]);

  // trigger 변경 시 한 번 점프
  useEffect(() => {
    if (autoPlay) return;
    if (trigger === undefined) return;
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: -jumpHeight * 1.5,
        duration: duration / 2,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: duration / 2,
        easing: Easing.bounce,
        useNativeDriver: true
      })
    ]).start();
  }, [trigger, autoPlay, jumpHeight, duration, translateY]);

  return (
    <View style={[styles.wrap, style]}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <RabbitSprite size={size} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-end'
  }
});

export default JumpingRabbit;
