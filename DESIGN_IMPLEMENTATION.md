# 🎨 HOP 디자인 시스템 구현 가이드

## 📋 개요

HOP의 디자인 시스템이 완성되었습니다! 이 문서는 디자인을 실제 코드에 어떻게 적용하는지 보여줍니다.

---

## 🎯 3가지 핵심 파일

### 1. **src/theme/tokens.js** - 디자인 토큰
모든 색상, 타이포그래피, 간격 정의

```javascript
import { colors, typography, spacing, componentThemes } from '../theme/tokens';

// 색상 사용
backgroundColor: colors.primary.warmSage // #7FB069

// 타이포그래피 사용
fontSize: typography.fontSize.h2 // 18px
fontWeight: typography.fontWeight.bold // 700

// 간격 사용
paddingHorizontal: spacing.md // 16px

// 컴포넌트 테마 사용
const buttonStyle = componentThemes.button.primary;
```

### 2. **src/constants/copy.js** - UX 카피
모든 텍스트와 메시지 (5가지 핵심 메시지 포함)

```javascript
import { copy, getWinnerMessage } from '../constants/copy';

// 기본 카피
const text = copy.home.authCompleted('3.2', '32');
// "오늘의 Hop 완료! 3.2km 러닝"

// 핵심 메시지 1: 오늘의 Hop 완료!
<Text>{copy.home.card.todayHop}</Text>

// 핵심 메시지 2: 거북이가 따라오고 있어요 🐢
<Text>{copy.home.turtleCatching.message}</Text>

// 핵심 메시지 3: 토끼가 잠들기 전에 Hop 하세요
<Text>{copy.home.rabbitSleeping.message}</Text>

// 핵심 메시지 4: 3일 연속 Hop 성공!
<Text>{copy.result.streak.message(3)}</Text>

// 핵심 메시지 5: 이번 레이스의 승자는 토끼입니다
<Text>{getWinnerMessage(67)}</Text>
```

### 3. **src/components/HopButton.js** - 재사용 컴포넌트 (예시)
디자인 토큰을 활용한 커스텀 컴포넌트

```javascript
import HopButton from '../components/HopButton';

// 사용
<HopButton
  title="+ Hop 하기"
  variant="primary"
  onPress={() => navigation.navigate('Auth')}
/>

<HopButton
  title="취소"
  variant="secondary"
  onPress={() => navigation.goBack()}
/>

<HopButton
  title="비활성 상태"
  disabled={true}
/>
```

---

## 🛠️ 구현 단계별 가이드

### Step 1: 색상 적용
```javascript
// HomeScreen.js에서
import { colors, hopTheme } from '../theme/tokens';

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: hopTheme.rabbit, // #7FB069 (토끼)
  },
  progressBar: {
    fill: colors.primary.warmSage,    // 토끼 색
  },
  progressBarTurtle: {
    fill: colors.primary.coolMoss,    // 거북이 색
  }
});
```

### Step 2: 타이포그래피 적용
```javascript
import { typography } from '../theme/tokens';

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.h2,
    fontWeight: String(typography.fontWeight.bold),
    color: colors.neutral.textDark
  },
  body: {
    fontSize: typography.fontSize.body,
    fontWeight: String(typography.fontWeight.regular),
    color: colors.neutral.textMedium,
    lineHeight: typography.fontSize.body * typography.lineHeight.normal
  }
});
```

### Step 3: 간격 적용
```javascript
import { spacing } from '../theme/tokens';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md
  }
});
```

### Step 4: UX 카피 적용
```javascript
import { copy } from '../constants/copy';

<Text style={styles.title}>
  {copy.home.authCompleted(3.2, '32').title}
</Text>

<Text style={styles.subtitle}>
  {copy.home.authCompleted(3.2, '32').subtitle}
</Text>
```

---

## 💻 재사용 컴포넌트 구현 체크리스트

### 필수 컴포넌트

```
필수:
- [ ] HopButton (primary, secondary, disabled)
- [ ] HopProgressBar (토끼, 거북이)
- [ ] HopCard (기본, 성공, 경고)
- [ ] HopBadge (완료, 진행중, 연속, 우승)

권장:
- [ ] HopText (제목, 본문, 캡션)
- [ ] HopInput (입력 필드)
- [ ] HopModal (모달 팝업)
- [ ] HopAnimation (토끼 점프, 거북이 움직임)
```

### HopButton 예시
```javascript
// src/components/HopButton.js
import { tokens, componentThemes } from '../theme/tokens';

const HopButton = ({ title, variant = 'primary', onPress, disabled }) => {
  const theme = componentThemes.button[disabled ? 'disabled' : variant];

  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.border,
        borderWidth: theme.borderWidth,
        height: theme.height,
        borderRadius: tokens.borderRadius.xs
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={{ color: theme.text, fontSize: tokens.typography.fontSize.button }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
```

### HopProgressBar 예시
```javascript
// src/components/HopProgressBar.js
import { colors, componentThemes } from '../theme/tokens';

const HopProgressBar = ({ progress, type = 'rabbit', label }) => {
  const theme = componentThemes.progressBar[type]; // rabbit | turtle

  return (
    <View>
      <View style={{ borderWidth: 1, borderColor: theme.border }}>
        <View style={{
          height: 12,
          backgroundColor: theme.fill,
          width: `${progress}%`
        }} />
      </View>
      {label && <Text>{label}</Text>}
    </View>
  );
};
```

---

## 🎨 색상 매핑 가이드

### 현재 코드 (수정 전)
```javascript
backgroundColor: '#FF6B6B'  // ❌ 임의의 색상
color: '#4CAF50'           // ❌ 명확하지 않음
```

### 개선된 코드 (토큰 사용)
```javascript
import { colors, hopTheme } from '../theme/tokens';

backgroundColor: hopTheme.rabbit    // ✅ #7FB069
backgroundColor: hopTheme.turtle    // ✅ #5D8F3F
backgroundColor: hopTheme.carrot    // ✅ #E67E22

// 또는 명시적으로
backgroundColor: colors.primary.warmSage  // ✅ #7FB069
color: colors.neutral.textDark            // ✅ #2D5016
```

---

## 📝 UX 카피 적용 위치

### 홈 화면 (HomeScreen.js)

```javascript
import { copy } from '../constants/copy';

// 핵심 메시지 1: "오늘의 Hop 완료!"
<Card>
  <Text>{copy.home.card.todayHop}</Text>
  <Text style={{ color: hopTheme.rabbit }}>
    {copy.home.card.completed}
  </Text>
</Card>

// 핵심 메시지 2: "거북이가 따라오고 있어요 🐢"
{turtleProgress < rabbitProgress && (
  <Alert message={copy.home.turtleCatching.message} />
)}

// 핵심 메시지 3: "토끼가 잠들기 전에 Hop 하세요"
{hour >= 22 && !todayAuth && (
  <Alert message={copy.home.rabbitSleeping.message} />
)}
```

### 결과 화면 (ResultScreen.js)

```javascript
import { copy, getWinnerMessage } from '../constants/copy';

// 핵심 메시지 5: "이번 레이스의 승자는 토끼입니다"
<Text style={styles.winnerText}>
  {getWinnerMessage(completionRate)}
</Text>

// 핵심 메시지 4: "3일 연속 Hop 성공!"
{streak >= 3 && (
  <Badge>
    {copy.result.streak.message(streak)}
  </Badge>
)}
```

---

## 🎬 애니메이션 토큰 사용

```javascript
import { animation } from '../theme/tokens';

// 토끼 점프 애니메이션
Animated.timing(position, {
  toValue: 100,
  duration: animation.duration.normal, // 300ms
  easing: animation.easing.bounce
}).start();

// 거북이 따라오기 (느림)
Animated.timing(position, {
  toValue: 50,
  duration: animation.duration.slow, // 500ms
  easing: animation.easing.easeOut
}).start();

// 결과 화면 연쇄 (매우 느림)
Animated.stagger(
  animation.duration.verySlow, // 1000ms 간격
  [anim1, anim2, anim3]
).start();
```

---

## 📱 반응형 디자인 적용

```javascript
import { breakpoints, spacing } from '../theme/tokens';

const windowWidth = useWindowDimensions().width;
const isMobile = windowWidth < breakpoints.lg;
const padding = isMobile ? spacing.md : spacing.lg;

return (
  <View style={{ paddingHorizontal: padding }}>
    {/* 콘텐츠 */}
  </View>
);
```

---

## ✨ 접근성 고려사항

### 색상 대비 확인
```javascript
// ✅ 충분한 대비 (4.5:1)
color: colors.neutral.textDark (#2D5016)
backgroundColor: colors.secondary.warmBeige (#E8DCC8)

// ❌ 부족한 대비
color: colors.neutral.textLight (#666)
backgroundColor: colors.secondary.warmBeige (#E8DCC8)
```

### 터치 타겟 크기
```javascript
// ✅ 최소 44x44px
height: sizes.button.height, // 44px

// ❌ 너무 작음
height: 32 // 권장되지 않음
```

### 텍스트 명확성
```javascript
// ✅ 충분한 폰트 크기
fontSize: typography.fontSize.body, // 12px 이상

// ❌ 너무 작음
fontSize: 8 // 읽기 어려움
```

---

## 🔍 검증 체크리스트

### 색상
- [ ] 모든 HEX 코드가 tokens.js와 일치
- [ ] 색맹 사용자를 위한 색상 외 구분 수단 있음
- [ ] 텍스트 대비 비율 4.5:1 이상

### 타이포그래피
- [ ] 폰트 크기가 tokens.js의 값 사용
- [ ] 폰트 굵기가 일관성 있음
- [ ] 라인하이트가 읽기 좋게 설정

### 간격
- [ ] 패딩/마진이 spacing 값 사용
- [ ] 컴포넌트 간 간격이 일관성 있음

### UX 카피
- [ ] 5가지 핵심 메시지 모두 포함
- [ ] 톤 일관성 확인 (게임 + 감성 + 따뜻함)
- [ ] 오타/문법 확인

### 접근성
- [ ] 최소 터치 타겟 44x44px
- [ ] 색상 대비 4.5:1 이상
- [ ] 폰트 크기 최소 12px

---

## 📚 참고 파일 위치

```
C:\dev\project\Hopit\
├── DESIGN_SYSTEM.md          ← 전체 디자인 규칙
├── DESIGN_IMPLEMENTATION.md  ← 이 파일 (구현 가이드)
├── src/
│   ├── theme/
│   │   └── tokens.js         ← 디자인 토큰 (색상, 타이포그래피 등)
│   ├── constants/
│   │   └── copy.js           ← UX 카피 (5가지 핵심 메시지)
│   ├── components/
│   │   ├── HopButton.js      ← 커스텀 버튼 (예시)
│   │   ├── HopProgressBar.js ← 프로그레스 바 (예시)
│   │   ├── HopCard.js        ← 카드 (예시)
│   │   └── ...
│   └── screens/
│       ├── HomeScreen.js     ← 수정 필요
│       ├── ResultScreen.js   ← 수정 필요
│       └── ...
```

---

## 🚀 다음 단계

### 1. 재사용 컴포넌트 만들기
- [ ] HopButton ✅ (완료)
- [ ] HopProgressBar
- [ ] HopCard
- [ ] HopBadge
- [ ] HopText
- [ ] HopInput

### 2. 기존 화면 리팩토링
- [ ] HomeScreen: 색상 + 카피 적용
- [ ] ResultScreen: 5가지 메시지 구현
- [ ] SettingsScreen: 버튼 스타일 통일
- [ ] 모든 화면: 타이포그래피 통일

### 3. 애니메이션 추가
- [ ] 토끼 점프 애니메이션
- [ ] 거북이 따라오기 애니메이션
- [ ] 결과 화면 연쇄 애니메이션

### 4. 테스트
- [ ] 색상 대비 테스트
- [ ] 폰트 크기 테스트
- [ ] 터치 타겟 테스트
- [ ] 텍스트 렌더링 테스트

---

## 💡 팁

1. **디자인 토큰 활용**: 항상 `tokens.js`의 값을 직접 참조
2. **복사/붙여넣기 금지**: 색상 HEX를 하드코딩하지 말기
3. **일관성 유지**: 모든 화면에서 같은 토큰 사용
4. **미래 유지보수**: 나중에 디자인 변경 시 `tokens.js`만 수정하면 전체 앱 변경됨

---

**Happy Designing! 🎨🐰**
