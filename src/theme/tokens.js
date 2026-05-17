/**
 * HOP - 디자인 토큰 (색상, 타이포그래피, 간격 등)
 * 픽셀 아트 + 자연친화 색감
 */

// ========== COLOR PALETTE ==========

export const colors = {
  // Primary Colors (주색상)
  primary: {
    warmSage: '#7FB069',    // 토끼, 성공, CTA
    coolMoss: '#5D8F3F',    // 거북이, 안정감
    warmBrown: '#8B5A3C',   // 텍스트, 악센트
    carrotOrange: '#E67E22' // 강조, 경고
  },

  // Secondary Colors (보조색상)
  secondary: {
    warmBeige: '#E8DCC8',   // 카드, 버튼 배경
    skyBlue: '#9CC5D4',     // 정보, 진행
    paleGreen: '#C9E4A6',   // 하이라이트
    neutralGray: '#D4D4C8'  // 비활성, 배경
  },

  // Neutral Colors (중립색)
  neutral: {
    textDark: '#2D5016',    // 큰 제목
    textMedium: '#333333',  // 본문
    textLight: '#666666',   // 부제목
    bgWhite: '#F5F3F0',     // 메인 배경
    bgLight: '#F9F9F9',     // 가벼운 배경
    bgDark: '#E8E8E0'       // 어두운 배경
  },

  // Semantic Colors
  success: '#72AC5A',       // 완료, 성공
  warning: '#F5A623',       // 경고, 주의
  info: '#5DADE2',          // 정보, 안내
  error: '#E74C3C'          // 오류, 실패
};

// ========== TYPOGRAPHY ==========

export const typography = {
  fontFamily: {
    primary: 'Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'Courier New, monospace'
  },

  fontSize: {
    // Display & Heading
    h1: 20,     // 큰 제목
    h2: 18,     // 제목
    h3: 16,     // 중간 제목
    h4: 14,     // 소제목

    // Body
    body: 12,       // 기본 본문
    bodySmall: 11,  // 작은 본문
    caption: 10,    // 캡션

    // Special
    button: 12  // 버튼 텍스트
  },

  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75
  }
};

// ========== SPACING ==========

export const spacing = {
  xs: 4,      // 매우 좁음
  sm: 8,      // 좁음
  md: 16,     // 표준
  lg: 24,     // 넓음
  xl: 32,     // 매우 넓음
  xxl: 48     // 아주 넓음
};

// ========== BORDER RADIUS ==========

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  full: 999
};

// ========== SHADOWS ==========

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.1)',
  md: '0 2px 4px rgba(0,0,0,0.1)',
  lg: '0 4px 8px rgba(0,0,0,0.15)',

  // 픽셀 스타일 (경계만)
  pixelSm: '2px 2px 0px rgba(0,0,0,0.2)',
  pixelMd: '3px 3px 0px rgba(0,0,0,0.2)',
  pixelLg: '4px 4px 0px rgba(0,0,0,0.25)'
};

// ========== COMPONENT SIZES ==========

export const sizes = {
  button: {
    height: 44,  // 터치 타겟 최소 크기
    padding: spacing.md
  },

  input: {
    height: 40,
    padding: spacing.md
  },

  card: {
    padding: spacing.md,
    borderWidth: 2
  },

  progressBar: {
    height: 12,
    borderWidth: 1
  }
};

// ========== ANIMATION TIMING ==========

export const animation = {
  duration: {
    fast: 200,      // 빠름 (200ms)
    normal: 300,    // 보통 (300ms)
    slow: 500,      // 느림 (500ms)
    verySlow: 1000  // 매우 느림 (1000ms)
  },

  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

// ========== BREAKPOINTS (반응형) ==========

export const breakpoints = {
  xs: 320,    // 모바일
  sm: 375,    // 모바일
  md: 428,    // 모바일 (큼)
  lg: 768,    // 태블릿
  xl: 1024,   // 데스크톱
  xxl: 1440   // 큰 데스크톱
};

// ========== HOP SPECIFIC ==========

export const hopTheme = {
  rabbit: colors.primary.warmSage,       // #7FB069
  turtle: colors.primary.coolMoss,       // #5D8F3F
  carrot: colors.primary.carrotOrange,   // #E67E22

  // 상태별 색상
  states: {
    completed: colors.success,           // 완료 (#72AC5A)
    inProgress: colors.info,             // 진행중 (#5DADE2)
    consecutive: colors.warning,         // 연속 (#F5A623)
    winner: colors.primary.warmSage      // 우승 (#7FB069)
  },

  // 배경 조합
  backgrounds: {
    celebration: '#FFF9E6',  // 축하 (밝은 베이지)
    mapArea: '#E8F5E9'       // 지도 (밝은 초록)
  }
};

// ========== COMPONENT THEMES ==========

export const componentThemes = {
  button: {
    primary: {
      bg: colors.primary.warmSage,
      border: colors.primary.coolMoss,
      text: '#FFFFFF',
      borderWidth: 2,
      height: sizes.button.height
    },

    secondary: {
      bg: colors.secondary.warmBeige,
      border: colors.primary.warmBrown,
      text: colors.neutral.textMedium,
      borderWidth: 2,
      height: sizes.button.height
    },

    disabled: {
      bg: colors.secondary.neutralGray,
      border: colors.neutral.textLight,
      text: colors.neutral.textLight,
      borderWidth: 2,
      height: sizes.button.height
    }
  },

  progressBar: {
    rabbit: {
      track: colors.secondary.warmBeige,
      fill: colors.primary.warmSage,
      border: colors.neutral.textLight
    },

    turtle: {
      track: colors.secondary.warmBeige,
      fill: colors.primary.coolMoss,
      border: colors.neutral.textLight
    }
  },

  card: {
    default: {
      bg: '#FFFFFF',
      border: colors.secondary.neutralGray,
      shadow: shadows.pixelMd
    },

    success: {
      bg: '#FFFFFF',
      border: colors.primary.warmSage,
      shadow: shadows.pixelMd
    },

    warning: {
      bg: '#FFFFFF',
      border: colors.primary.carrotOrange,
      shadow: shadows.pixelMd
    }
  }
};

// ========== UTILITIES ==========

/**
 * HOP 색상 가져오기
 */
export const getHopColor = (type) => {
  const colorMap = {
    rabbit: hopTheme.rabbit,
    turtle: hopTheme.turtle,
    carrot: hopTheme.carrot,
    success: hopTheme.states.completed,
    warning: hopTheme.states.consecutive,
    info: hopTheme.states.inProgress
  };

  return colorMap[type] || hopTheme.rabbit;
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  sizes,
  animation,
  breakpoints,
  hopTheme,
  componentThemes,
  getHopColor
};
