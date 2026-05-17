/**
 * HOP - UX 카피 (텍스트 콘텐츠)
 * 5가지 핵심 메시지 + 일관된 톤
 */

export const copy = {
  // ========== 온보딩 ==========
  onboarding: {
    title: '토끼 vs 거북이',
    subtitle: '러닝 습관 경주 게임',
    description: '매일 러닝을 인증하고\n토끼가 거북이를 이기세요!',
    feature1: '✓ GPS 또는 사진으로 인증',
    feature2: '✓ 실시간 진행 현황 추적',
    feature3: '✓ 50% 기준으로 우승자 판정',
    buttonStart: '시작하기'
  },

  // ========== 초기 설정 ==========
  settings: {
    title: '경주 설정',
    label: {
      period: '⏰ 경주 기간',
      goal: '🎯 주간 목표',
      goalHint: '일주일에 몇 회 인증?',
      method: '✓ 인증 방법'
    },
    methodLabels: {
      gps: '📍 GPS',
      photo: '📸 사진'
    },
    buttonStart: '경주 시작',
    buttonCancel: '취소'
  },

  // ========== 홈 화면 ==========
  home: {
    header: '경주 진행중',
    headerDaysRemaining: (days) => `남은 ${days}일`,

    // 토끼 (사용자)
    rabbit: {
      label: '🐰 토끼',
      sublabel: '(당신)',
      daysProgress: (current, total) => `${current}/${total}일`
    },

    // 거북이 (고정 속도)
    turtle: {
      label: '🐢 거북이',
      sublabel: '(고정 속도)'
    },

    // 카드 제목들
    card: {
      todayHop: '오늘의 Hop',
      completed: '완료!',
      stats: '완료',
      goal: '목표'
    },

    // ===== 핵심 메시지 1 =====
    // "오늘의 Hop 완료!"
    authCompleted: (distance, time) => ({
      title: '오늘의 Hop 완료!',
      subtitle: `${distance}km 러닝`,
      emoji: '🎉'
    }),

    // ===== 핵심 메시지 2 =====
    // "거북이가 따라오고 있어요 🐢"
    turtleCatching: {
      message: '거북이가 따라오고 있어요 🐢',
      cta: 'Hop하세요!'
    },

    // ===== 핵심 메시지 3 =====
    // "토끼가 잠들기 전에 Hop 하세요"
    rabbitSleeping: {
      message: '토끼가 잠들기 전에 Hop 하세요 💤',
      time: '(밤 10시 이후)'
    },

    // 버튼
    button: {
      authNow: '+ 러닝 인증하기',
      stats: '📊 상세 통계 보기',
      refresh: '새로고침'
    },

    // 빈 상태
    empty: {
      title: '경주가 없습니다',
      subtitle: '새로운 경주를 시작하세요!',
      button: '경주 시작하기'
    }
  },

  // ========== 인증 선택 ==========
  authChoice: {
    title: '인증 방법 선택',

    gps: {
      emoji: '🗺️',
      title: 'GPS 자동 인증',
      description: '실시간 위치 기반 인식',
      requirement: '최소 거리: 3km',
      button: 'GPS 시작'
    },

    photo: {
      emoji: '📸',
      title: '사진 인증',
      description: '러닝 인증샷 업로드',
      requirement: '언제든지 인증 가능',
      button: '사진 선택'
    },

    empty: {
      message: '경주가 없습니다'
    }
  },

  // ========== GPS 화면 ==========
  gps: {
    title: 'GPS 맵 추적',

    state: {
      idle: '🗺️ 위치 추적 준비됨',
      tracking: '🗺️ GPS 추적 중...'
    },

    stats: {
      distance: '현재 거리',
      time: '예상 시간',
      status: '상태'
    },

    button: {
      start: '🏃 시작',
      stop: '⏹ 중지',
      complete: '✓ 인증 완료',
      back: '← 돌아가기'
    },

    messages: {
      permissionRequired: '위치 권한이 필요합니다',
      distanceNotEnough: '최소 3km 이상 달려야 합니다',
      saveError: '인증 저장 실패',
      success: '인증이 완료되었습니다!'
    }
  },

  // ========== 사진 인증 ==========
  photo: {
    title: '사진 인증',

    placeholder: '📸 사진을 선택하세요',
    memoLabel: '인증 정보 (선택)',
    memoPlaceholder: '예: 공원 3km 러닝',

    button: {
      camera: '📷 촬영',
      gallery: '🖼️ 갤러리',
      submit: '✓ 인증하기',
      back: '← 돌아가기'
    },

    messages: {
      photoRequired: '사진을 선택하세요',
      cameraPermissionRequired: '카메라 권한이 필요합니다',
      photoNotSelected: '활성 경주가 없습니다',
      saveError: '인증 저장 실패',
      success: '인증이 완료되었습니다!'
    }
  },

  // ========== 통계 ==========
  stats: {
    title: '📊 통계',

    labels: {
      totalAuth: '총 인증',
      goal: '목표',
      rate: '진행률',
      elapsed: '경과 일수'
    },

    weeklyStats: '주간 완료',

    raceInfo: {
      title: '경주 정보',
      period: '기간',
      weeklyGoal: '주간 목표',
      methods: '인증 방법'
    },

    empty: {
      message: '경주 정보가 없습니다'
    }
  },

  // ========== 최종 결과 ==========
  result: {
    title: '경주 결과',
    celebrate: '🎉',
    ended: '경주 종료!',

    // ===== 핵심 메시지 4 =====
    // "3일 연속 Hop 성공!"
    streak: {
      badge: '🔥 3일 연속',
      message: (days) => `${days}일 연속 Hop 성공!`,
      keep: '계속해봐요!'
    },

    // ===== 핵심 메시지 5 =====
    // "이번 레이스의 승자는 토끼입니다"
    winner: {
      rabbit: '이번 레이스의 승자는 토끼입니다 🐰',
      turtle: '이번 레이스의 승자는 거북이입니다 🐢',
      tie: '비겼습니다! 🤝'
    },

    stats: {
      rabbit: '🐰 토끼 (당신)',
      turtle: '🐢 거북이',
      note: '50% 이상: 토끼 승리 | 50%: 비김 | 50% 미만: 거북이 승리'
    },

    button: {
      newRace: '새 경주 시작하기',
      home: '홈으로',
      share: '👍 공유하기'
    },

    empty: {
      message: '경주 정보가 없습니다'
    }
  },

  // ========== 톤 오브 보이스 가이드 ==========
  toneGuide: {
    do: {
      title: '원하는 톤',
      items: [
        '"Hop하세요!" (명령형 X, 제안형)',
        '이모지 활용으로 따뜻함 표현',
        '"거북이가 따라오고 있어요"',
        '스토리텔링으로 동기부여',
        '응원하는 톤으로 격려',
        '실패해도 괜찮다는 메시지'
      ]
    },

    dont: {
      title: '피할 톤',
      items: [
        '"목표를 달성하세요" (생산성 도구 같음)',
        '"KPI", "효율성", "최적화"',
        '"인증 실패!", "목표 미달" (너무 엄격함)',
        '"시간이 다 떨어졌습니다" (너무 심각함)',
        '위협적이거나 공포감 주는 메시지'
      ]
    }
  },

  // ========== 일반 메시지 ==========
  common: {
    loading: '로딩 중...',
    empty: '데이터가 없습니다',
    error: '오류가 발생했습니다',
    retry: '다시 시도',
    cancel: '취소',
    confirm: '확인',
    continue: '계속',
    skip: '건너뛰기',
    save: '저장',
    delete: '삭제',
    edit: '수정',
    close: '닫기'
  },

  // ========== 시간 관련 ==========
  time: {
    today: '오늘',
    yesterday: '어제',
    thisWeek: '이주',
    thisMonth: '이달',
    days: (count) => count === 1 ? '1일' : `${count}일`,
    hours: (count) => count === 1 ? '1시간' : `${count}시간`,
    minutes: (count) => count === 1 ? '1분' : `${count}분`,
    seconds: (count) => count === 1 ? '1초' : `${count}초`,
    daysRemaining: (count) => `남은 ${count}일`,
    daysElapsed: (current, total) => `${current}/${total}일`
  },

  // ========== 거리/속도 ==========
  distance: {
    km: (value) => `${value.toFixed(2)} km`,
    meters: (value) => `${value.toFixed(0)}m`,
    pace: (min, sec) => `${min}:${String(sec).padStart(2, '0')}/km`
  }
};

/**
 * 컨텍스트별 메시지 반환 함수들
 */
export const getMessage = (key, ...args) => {
  const keys = key.split('.');
  let value = copy;

  for (const k of keys) {
    value = value[k];
  }

  return typeof value === 'function' ? value(...args) : value;
};

/**
 * 진행률에 따른 우승자 메시지
 */
export const getWinnerMessage = (completionRate) => {
  if (completionRate < 50) {
    return copy.result.winner.turtle;
  } else if (completionRate === 50) {
    return copy.result.winner.tie;
  } else {
    return copy.result.winner.rabbit;
  }
};

/**
 * 연속 달성에 따른 메시지
 */
export const getStreakMessage = (days) => {
  return copy.result.streak.message(days);
};

export default copy;
