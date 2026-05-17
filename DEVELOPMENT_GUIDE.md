# 📋 토끼 vs 거북이 - 개발 가이드

## ✅ 완료된 단계

### Phase 1: 상세 와이어프레임 ✓
- **8개 핵심 화면** 설계 완료
  - 온보딩 → 초기 설정 → 홈 → 인증 선택 → GPS/사진 → 통계 → 결과

### Phase 2: 데이터베이스 스키마 ✓
- **3개 메인 테이블** 설계
  - `races` (경주 정보)
  - `authentications` (인증 기록)
  - `daily_progress` (일일 진행상황)
- 인덱스, 계산식, 마이그레이션 전략 문서화

### Phase 3: 코드 작성 ✓
**완성된 파일 목록:**

#### 핵심 설정
- ✅ `package.json` - 의존성 관리
- ✅ `app.json` - Expo 설정
- ✅ `App.js` - 메인 진입점 & 네비게이션

#### 데이터베이스
- ✅ `src/database/db.js` - SQLite 초기화
- ✅ `src/database/queries.js` - CRUD 쿼리 함수

#### 상태 관리
- ✅ `src/store/raceStore.js` - Zustand 상태관리 + 계산 함수

#### 유틸리티
- ✅ `src/utils/calculations.js` - 모든 계산 로직

#### 화면 컴포넌트 (8개)
- ✅ `src/screens/OnboardingScreen.js` - 온보딩
- ✅ `src/screens/SettingsScreen.js` - 경주 설정
- ✅ `src/screens/HomeScreen.js` - 홈 (경주 진행)
- ✅ `src/screens/AuthChoiceScreen.js` - 인증 방법 선택
- ✅ `src/screens/GPSScreen.js` - GPS 추적
- ✅ `src/screens/PhotoScreen.js` - 사진 인증
- ✅ `src/screens/StatsScreen.js` - 통계
- ✅ `src/screens/ResultScreen.js` - 최종 결과

#### 문서
- ✅ `README.md` - 프로젝트 개요
- ✅ `DB_SCHEMA.md` - 데이터베이스 상세 문서
- ✅ `.gitignore` - Git 설정

---

## 🚀 다음 단계

### 1. 의존성 설치 및 테스트

```bash
cd /path/to/rabbit-vs-turtle
npm install
npm start
```

### 2. 미흡한 부분 보완

#### 라이브러리 추가 필요
```bash
# DateTimePicker (SettingsScreen에서 필요)
npm install @react-native-community/datetimepicker

# AsyncStorage (온보딩 상태 저장)
npm install @react-native-async-storage/async-storage
```

#### App.js 수정 필요
```javascript
// AsyncStorage 추가 (현재 임시 코드)
import AsyncStorage from '@react-native-async-storage/async-storage';

// onboarding 여부 확인 로직 구현
const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
```

#### 화면 연결 확인
- [ ] 온보딩 → 초기 설정 흐름 동작 확인
- [ ] 경주 시작 후 홈 화면 표시 확인
- [ ] 하단 탭 네비게이션 동작 확인
- [ ] 각 인증 화면 (GPS/사진) 동작 확인

### 3. 기능 검증

#### GPS 기능
- [ ] 위치 권한 요청 테스트
- [ ] 거리 계산 정확성 (Haversine 공식)
- [ ] 최소 3km 검증
- [ ] 데이터베이스 저장 확인

#### 사진 기능
- [ ] 카메라 권한 요청 테스트
- [ ] 갤러리 선택 동작 확인
- [ ] 사진 파일 경로 저장 확인
- [ ] 메모 입력 및 저장 확인

#### 통계 기능
- [ ] 주간 차트 데이터 정확성
- [ ] 진행률 계산 검증
- [ ] 거북이 기대치 계산 검증

#### 결과 판정
- [ ] 50% 미만: 거북이 승리 확인
- [ ] 50% 동일: 비김 확인
- [ ] 50% 초과: 토끼 승리 확인

### 4. UI/UX 개선

#### 마실 사항
- [ ] 색상 일관성 (FF6B6B, 4CAF50 사용)
- [ ] 폰트 크기 계층 확인
- [ ] 버튼 크기 일관성
- [ ] 스페이싱 일관성

#### 애니메이션 추가
- [ ] 토끼/거북이 이동 애니메이션
- [ ] 프로그레스 바 부드러운 업데이트
- [ ] 결과 화면 축하 애니메이션

### 5. 오류 처리 강화

#### 에러 핸들링
- [ ] 데이터베이스 오류 처리
- [ ] 네트워크 오류 (향후 필요)
- [ ] 권한 거부 처리
- [ ] 잘못된 입력값 검증

#### 로깅
- [ ] console.log → logger로 변경
- [ ] 에러 스택 추적

---

## 📝 구현 체크리스트

### 핵심 기능

- [ ] **온보딩 플로우**
  - [ ] 온보딩 화면 표시
  - [ ] AsyncStorage에 완료 상태 저장
  - [ ] 초기 설정 화면으로 이동

- [ ] **경주 생성**
  - [ ] 날짜 선택기 동작
  - [ ] 주간 목표 입력/선택
  - [ ] 인증 방법 체크박스
  - [ ] 데이터베이스 저장

- [ ] **홈 화면**
  - [ ] 활성 경주 로드
  - [ ] 토끼/거북이 프로그레스 바 표시
  - [ ] 실시간 새로고침
  - [ ] 인증 버튼 → 인증 선택 화면

- [ ] **GPS 인증**
  - [ ] 위치 권한 요청
  - [ ] 실시간 추적 (타이머 포함)
  - [ ] 거리/시간 표시
  - [ ] 3km 이상 검증
  - [ ] 데이터베이스 저장

- [ ] **사진 인증**
  - [ ] 카메라/갤러리 선택
  - [ ] 사진 미리보기
  - [ ] 메모 입력 (선택)
  - [ ] 데이터베이스 저장

- [ ] **통계 화면**
  - [ ] 주간 바 차트
  - [ ] 진행률 표시
  - [ ] 경주 정보 표시

- [ ] **결과 화면**
  - [ ] 우승자 판정 (50% 기준)
  - [ ] 최종 진행률 표시
  - [ ] 새 경주 시작 버튼

### 보조 기능

- [ ] 경주 취소 기능
- [ ] 경주 초기화 기능
- [ ] 인증 기록 삭제 기능
- [ ] 데이터 내보내기 (CSV)

---

## 🔧 개발 팁

### 디버깅

```javascript
// 콘솔 로깅
console.log('현재 경주:', race);
console.log('인증 횟수:', authCount);
console.log('진행률:', completionRate);

// 쿼리 테스트
const stats = await getRaceStats(raceId);
console.log('통계:', stats);
```

### 데이터베이스 초기화

```javascript
// App.js에서 (개발 시에만)
import { resetDatabase } from './src/database/db';

useEffect(() => {
  // await resetDatabase(); // 주석 해제하면 초기화
}, []);
```

### 테스트 데이터 생성

```javascript
// queries.js에 테스트 함수 추가
export const seedTestData = async () => {
  const raceId = await createRace(
    new Date().toISOString(),
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    5,
    { gps: true, photo: true }
  );

  // 인증 기록 추가
  for (let i = 0; i < 10; i++) {
    await saveAuthentication(raceId, {
      type: 'gps',
      distance: 3 + Math.random() * 2,
      duration: 1800 + Math.random() * 600
    });
  }
};
```

---

## 📦 배포 준비

### iOS 배포

```bash
# 인증서 생성
eas build --platform ios

# 앱스토어 배포
eas submit --platform ios
```

### Android 배포

```bash
# APK 생성
eas build --platform android

# 플레이스토어 배포
eas submit --platform android
```

---

## 📚 참고 자료

- [Expo 공식 문서](https://docs.expo.dev/)
- [React Native 공식 문서](https://reactnative.dev/)
- [Zustand 문서](https://github.com/pmndrs/zustand)
- [React Navigation](https://reactnavigation.org/)
- [SQLite 쿼리](https://www.sqlite.org/lang.html)

---

## ❓ FAQ

### Q: 앱을 처음부터 다시 실행하려면?

```bash
# 데이터 초기화
npm start
# 터미널에서 'w' 입력하여 웹 리로드

# 또는 데이터베이스 초기화
// src/database/db.js에서 resetDatabase() 호출
```

### Q: GPS가 작동하지 않으면?

- Android: 에뮬레이터 위치 권한 확인
- iOS: 시뮬레이터 '위치' 설정 확인
- 실제 기기: 위치 서비스 활성화 확인

### Q: 사진이 저장되지 않으면?

- 파일 시스템 권한 확인
- Expo FileSystem 사용 확인 (아직 미구현)

### Q: 새로운 화면을 추가하려면?

1. `src/screens/NewScreen.js` 생성
2. `App.js`의 네비게이션에 추가
3. 다른 화면에서 `navigation.navigate('NewScreen')` 호출

---

**즐거운 개발되세요! 🚀**
