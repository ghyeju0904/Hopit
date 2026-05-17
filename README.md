# 🐰 🐢 토끼 vs 거북이 - 러닝 습관 앱

> 매일 러닝을 인증하고 토끼가 거북이를 이기는 모험!

## 📱 프로젝트 개요

토끼와 거북이의 경주를 모티브로 한 **러닝 습관 추적 앱**입니다. 사용자가 매일 러닝을 인증할 때마다 토끼가 거북이를 추월하고, 인증하지 못하면 토끼가 잠을 자고 거북이가 따라잡습니다.

### 🎯 핵심 기능

- **GPS 자동 인식**: 실시간 위치 기반으로 거리, 시간 자동 기록
- **사진 인증**: 언제든 사진으로 러닝 인증 가능
- **실시간 진행 추적**: 토끼(사용자) vs 거북이(고정 속도) 경주
- **우승자 판정**: 50% 기준 (< 50% 거북이 승, = 50% 비김, > 50% 토끼 승)
- **통계 분석**: 주간 차트, 진행률, 예상 결과

---

## 🛠️ 기술 스택

| Layer | 기술 | 설명 |
|-------|------|------|
| **Framework** | React Native (Expo) | 크로스플랫폼 모바일 개발 |
| **State Management** | Zustand | 가볍고 간단한 상태관리 |
| **Database** | SQLite (expo-sqlite) | 로컬 데이터 저장소 |
| **Location** | Expo Location | GPS 위치 추적 |
| **Camera** | Expo Image Picker | 사진 선택/촬영 |
| **UI Kit** | React Native Paper | Material Design 컴포넌트 |
| **Navigation** | React Navigation | 화면 전환 |
| **Charts** | react-native-chart-kit | 통계 시각화 |

---

## 📁 프로젝트 구조

```
rabbit-vs-turtle/
├── app.json                 # Expo 설정
├── App.js                   # 메인 진입점
├── package.json             # 의존성
├── DB_SCHEMA.md            # 데이터베이스 스키마
├── README.md               # 이 파일
│
├── src/
│   ├── database/
│   │   ├── db.js           # SQLite 초기화
│   │   └── queries.js      # 데이터베이스 쿼리 함수들
│   │
│   ├── screens/
│   │   ├── OnboardingScreen.js      # 온보딩
│   │   ├── SettingsScreen.js        # 경주 설정 및 초기화
│   │   ├── HomeScreen.js            # 홈 (경주 진행)
│   │   ├── AuthChoiceScreen.js      # 인증 방법 선택
│   │   ├── GPSScreen.js             # GPS 추적
│   │   ├── PhotoScreen.js           # 사진 인증
│   │   ├── StatsScreen.js           # 통계
│   │   └── ResultScreen.js          # 최종 결과
│   │
│   ├── store/
│   │   └── raceStore.js    # Zustand 상태관리
│   │
│   ├── utils/
│   │   └── calculations.js # 계산 함수들
│   │
│   └── components/         # 재사용 컴포넌트 (향후 추가)
│       ├── ProgressBar.js
│       ├── RaceStatus.js
│       └── BottomTabs.js
│
└── assets/
    ├── icon.png            # 앱 아이콘
    ├── splash.png          # 스플래시 화면
    └── images/             # 이미지 리소스
```

---

## 🚀 설치 및 실행

### 1. 환경 설정

```bash
# Node.js 16+ 필요
node --version

# 프로젝트 디렉토리로 이동
cd rabbit-vs-turtle

# 의존성 설치
npm install
```

### 2. Expo 설치

```bash
npm install -g expo-cli
```

### 3. 앱 실행

```bash
# 개발 서버 시작
npm start

# iOS 시뮬레이터 실행
npm run ios

# Android 에뮬레이터 실행
npm run android

# 웹 브라우저로 실행 (제한됨)
npm run web
```

### 4. 실제 기기에서 실행

1. Expo Go 앱 설치 (iOS/Android)
2. `npm start` 실행
3. QR 코드 스캔

---

## 📊 데이터베이스

### 주요 테이블

#### **races** - 경주 정보
```sql
- raceId (TEXT): 경주 고유ID
- startDate, endDate (TEXT): ISO 8601 형식
- weeklyGoal (INTEGER): 주간 목표 (1~7회)
- authMethodGPS, authMethodPhoto (BOOLEAN): 인증 방법
- completionRate (REAL): 최종 완료율
- finalResult (TEXT): 'rabbit' | 'turtle' | 'tie' | 'pending'
```

#### **authentications** - 인증 기록
```sql
- authId (TEXT): 고유ID
- type (TEXT): 'gps' | 'photo'
- distance (REAL): GPS 거리 (km)
- duration (INTEGER): GPS 시간 (초)
- photoPath (TEXT): 사진 경로
- memo (TEXT): 메모
```

#### **daily_progress** - 일일 진행상황
```sql
- rabbitCount (INTEGER): 사용자 누적 인증 횟수
- turtleExpectedCount (INTEGER): 거북이 기대치
- completionRate (REAL): 완료율 (%)
```

### 쿼리 함수

주요 함수는 `src/database/queries.js`에 구현되어 있습니다:

```javascript
// 경주
createRace()              // 새 경주 생성
getActiveRace()           // 활성 경주 조회
updateRaceStatus()        // 경주 상태 업데이트

// 인증
saveAuthentication()      // 인증 저장
getAuthenticationCount()  // 인증 횟수 조회
hasAuthenticationToday()  // 오늘 인증 여부

// 진행상황
updateDailyProgress()     // 일일 진행 업데이트
getDailyProgress()        // 일일 진행 조회
```

---

## 🧮 계산 로직

### 완료율 계산

```javascript
completionRate = (현재_인증_횟수 / 목표_총_횟수) × 100

// 목표 = weeklyGoal × (경주_기간 / 7일)
// 예: 5회/주 × 4주 = 20회 목표
// 실제 10회 인증 → 50% 완료
```

### 우승자 판정

```javascript
if (completionRate < 50%) → 🐢 거북이 승리
if (completionRate = 50%)  → 🤝 비김
if (completionRate > 50%)  → 🐰 토끼 승리
```

### 거북이 진행도 (고정)

```javascript
거북이_기대치 = weeklyGoal × (경과_일수 / 7)

// 예: 5회/주, 경과 14일
// 거북이도 50% 위치 (10회 기대)
```

---

## 🔄 주요 플로우

### 1. 앱 시작 → 온보딩 → 초기 설정 → 홈

1. **온보딩** 화면에서 앱 설명 확인
2. **초기 설정** 화면에서:
   - 경주 기간 (시작일~종료일)
   - 주간 목표 (3~7회)
   - 인증 방법 (GPS, 사진, 둘 다)
3. "경주 시작" 클릭 → 데이터베이스에 저장
4. 홈 화면으로 이동 (카운트다운 시작)

### 2. 러닝 인증

1. 홈 화면에서 "+ 러닝 인증하기" 클릭
2. **인증 방법 선택**:
   - **GPS**: 위치 추적 → 거리 검증 (최소 3km)
   - **사진**: 갤러리/카메라 → 메모 (선택)
3. 인증 완료 → 데이터베이스 저장
4. 홈 화면 업데이트 (토끼 위치 이동)

### 3. 경주 종료 (자동, 매일 자정)

1. 현재 시간 > 종료일?
2. 완료율 계산 (인증_횟수 / 목표)
3. 우승자 판정 (50% 기준)
4. 상태 업데이트 → `status = 'completed'`
5. 결과 화면 표시

---

## 🎨 UI/UX 가이드

### 색상 팔레트
- **Primary**: `#FF6B6B` (토끼 빨강)
- **Secondary**: `#4CAF50` (거북이 초록)
- **Accent**: `#FFC107` (강조)
- **Background**: `#F5F5F5` (밝은 회색)

### 타이포그래피
- **제목**: 20-28px, 600-700 weight
- **본문**: 13-14px, 400 weight
- **캡션**: 11-12px, 400 weight, #999

### 반응형 디자인
- 모바일 우선 (Expo는 네이티브 반응형 자동 지원)
- 태블릿 고려 (iPad 지원)

---

## 🧪 테스트

### 단위 테스트 (향후)

```bash
npm test
```

### 수동 테스트 체크리스트

- [ ] 온보딩 → 초기 설정 완료
- [ ] GPS 인증 (3km 이상)
- [ ] 사진 인증 (갤러리/카메라)
- [ ] 홈 화면 실시간 업데이트
- [ ] 통계 화면 데이터 정확성
- [ ] 경주 종료 (50% 기준 판정)
- [ ] 새 경주 시작 가능

---

## 🐛 알려진 이슈

- [ ] DateTimePicker 라이브러리 호환성 확인 필요
- [ ] GPS 정확도 (실내 환경)
- [ ] 대용량 사진 처리 (메모리 최적화)

---

## 🚧 향후 계획

### Phase 2: 클라우드 동기화
- Firebase Firestore 또는 Supabase PostgreSQL 연동
- 여러 기기 동기화
- 사용자 계정 시스템

### Phase 3: 소셜 기능
- 친구 추가 및 경주 공유
- 글로벌 순위표
- 도전 과제

### Phase 4: 고급 기능
- 주간 목표 자동 조정
- AI 기반 피드백
- 스트릭 시스템 (연속 완료)
- 배지 및 보상

---

## 📝 개발 가이드

### 새 기능 추가 시

1. **UI 추가**:
   - `src/screens/` 에 새 화면 생성
   - `App.js` 에 네비게이션 추가

2. **데이터 추가**:
   - `src/database/queries.js` 에 쿼리 함수 추가
   - `DB_SCHEMA.md` 스키마 업데이트

3. **상태 관리**:
   - `src/store/raceStore.js` 에 액션 추가

4. **테스트**:
   - 해당 기능 수동 테스트

---

## 📄 라이센스

MIT

---

## 👨‍💻 기여

버그 리포트, 기능 제안, PR 환영합니다!

---

## 📞 문의

궁금한 점이 있으시면 이슈를 생성해주세요.

---

**Happy Running! 🏃‍♂️🐰**
