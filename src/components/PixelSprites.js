import React from 'react';
import Svg, { Rect, G } from 'react-native-svg';
import { colors } from '../theme/tokens';

/**
 * HOP 픽셀 스프라이트
 *
 * 16x16 픽셀 그리드를 SVG <Rect>로 그린 단순 캐릭터.
 * 추후 실제 PNG 스프라이트 시트로 교체할 수 있도록 동일 props 인터페이스 유지.
 *
 * Props:
 * - size: 출력 픽셀 크기 (정사각, 기본 64)
 */

// 색상 약어
const C = {
  rabbitBody: colors.primary.warmSage,    // #7FB069
  rabbitDark: colors.primary.coolMoss,    // #5D8F3F
  turtleShell: colors.primary.coolMoss,   // #5D8F3F
  turtleBody: '#A4C77E',
  carrot: colors.primary.carrotOrange,    // #E67E22
  carrotLeaf: colors.primary.warmSage,
  eye: '#2D5016',
  white: '#FFFFFF',
  black: '#1F1F1F'
};

const GRID = 16;

/**
 * 픽셀 그리드 → SVG Rect 배열 변환
 * map: 16x16 2차원 배열, 각 셀은 색상 키 또는 null
 */
const renderGrid = (map, palette) => {
  const rects = [];
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const key = map[y][x];
      if (!key) continue;
      const fill = palette[key];
      if (!fill) continue;
      rects.push(
        <Rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
      );
    }
  }
  return rects;
};

/**
 * 토끼 스프라이트 (서있는 자세)
 */
export const RabbitSprite = ({ size = 64, style }) => {
  // 16x16 픽셀맵 (b=body, d=dark, w=white, e=eye)
  const map = [
    [null,'d',null,null,null,null,null,null,null,null,null,null,'d',null,null,null],
    ['d','b','d',null,null,null,null,null,null,null,null,'d','b','d',null,null],
    ['d','b','d',null,null,null,null,null,null,null,null,'d','b','d',null,null],
    ['d','b','d',null,null,'d','d','d','d','d','d','d','b','d',null,null],
    [null,'d','b','d','d','b','b','b','b','b','b','b','b','d',null,null],
    [null,null,'d','b','b','b','e','b','b','e','b','b','b','d',null,null],
    [null,null,'d','b','b','b','b','b','b','b','b','b','b','d',null,null],
    [null,null,'d','b','b','b','b','w','w','b','b','b','b','d',null,null],
    [null,null,'d','b','b','b','b','b','b','b','b','b','b','d',null,null],
    [null,null,null,'d','b','b','b','b','b','b','b','b','d',null,null,null],
    [null,null,null,'d','b','b','b','b','b','b','b','b','d',null,null,null],
    [null,null,null,'d','b','b','b','b','b','b','b','b','d',null,null,null],
    [null,null,null,'d','b','b','b','d','d','b','b','b','d',null,null,null],
    [null,null,null,null,'d','b','d',null,null,'d','b','d',null,null,null,null],
    [null,null,null,null,'d','d',null,null,null,null,'d','d',null,null,null,null],
    [null,null,null,null,'w','w',null,null,null,null,'w','w',null,null,null,null]
  ];

  const palette = {
    b: C.rabbitBody,
    d: C.rabbitDark,
    w: C.white,
    e: C.eye
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${GRID} ${GRID}`} style={style}>
      {renderGrid(map, palette)}
    </Svg>
  );
};

/**
 * 거북이 스프라이트
 */
export const TurtleSprite = ({ size = 64, style }) => {
  const map = [
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,'s','s','s','s','s','s','s','s',null,null,null,null],
    [null,null,null,'s','s','d','d','s','s','d','d','s','s',null,null,null],
    [null,null,'s','s','d','s','s','d','d','s','s','d','s','s',null,null],
    [null,null,'s','d','s','d','d','s','s','d','d','s','d','s',null,null],
    [null,'b','s','s','d','s','s','d','d','s','s','d','s','s','b',null],
    [null,'b','b','s','s','d','d','s','s','d','d','s','s','b','b',null],
    [null,null,'b','b','s','s','s','s','s','s','s','s','b','b',null,null],
    [null,null,null,'b','b','b','b','e','b','e','b','b','b',null,null,null],
    [null,null,null,'b','b','b','b','b','b','b','b','b','b',null,null,null],
    [null,null,null,null,'b','b','b','b','b','b','b','b',null,null,null,null],
    [null,null,null,'b','b',null,null,null,null,null,null,'b','b',null,null,null],
    [null,null,'b','b',null,null,null,null,null,null,null,null,'b','b',null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]
  ];

  const palette = {
    s: C.turtleShell,
    d: '#3F6F2A',
    b: C.turtleBody,
    e: C.eye
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${GRID} ${GRID}`} style={style}>
      {renderGrid(map, palette)}
    </Svg>
  );
};

/**
 * 당근 스프라이트 (작은 액센트용)
 */
export const CarrotSprite = ({ size = 32, style }) => {
  const map = [
    [null,null,null,null,'l','l',null,null,null,null,null,null,null,null,null,null],
    [null,null,null,'l','l','l','l',null,null,null,null,null,null,null,null,null],
    [null,null,'l','l','l','l','l','l',null,null,null,null,null,null,null,null],
    [null,null,null,'l','l','l','l',null,null,null,null,null,null,null,null,null],
    [null,null,null,null,'c','c',null,null,null,null,null,null,null,null,null,null],
    [null,null,null,'c','c','c','c',null,null,null,null,null,null,null,null,null],
    [null,null,null,'c','c','c','c',null,null,null,null,null,null,null,null,null],
    [null,null,null,null,'c','c',null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,'c','c',null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,'c',null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]
  ];

  const palette = {
    c: C.carrot,
    l: C.carrotLeaf
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${GRID} ${GRID}`} style={style}>
      {renderGrid(map, palette)}
    </Svg>
  );
};

export default { RabbitSprite, TurtleSprite, CarrotSprite };
