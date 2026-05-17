# 🗄️ 토끼 vs 거북이 - 데이터베이스 스키마

## 📊 전체 구조

```
┌─────────────────────────────┐
│     races (경주 정보)        │ ← 메인 테이블
├─────────────────────────────┤
│ • raceId (PK)               │
│ • startDate                 │
│ • endDate                   │
│ • weeklyGoal                │
│ • createdAt                 │
└─────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │ authentications     │  ← 인증 기록
    ├─────────────────────┤
    │ • authId (PK)       │
    │ • raceId (FK)       │
    │ • type (GPS/PHOTO)  │
    │ • distance          │
    │ • photoPath         │
    │ • timestamp         │
    └─────────────────────┘
```

---

## 🗂️ 테이블 정의

### 1️⃣ **races** (경주 정보)
```sql
CREATE TABLE races (
  raceId TEXT PRIMARY KEY,           -- UUID
  startDate TEXT NOT NULL,           -- ISO 8601 (2026-05-11T00:00:00Z)
  endDate TEXT NOT NULL,             -- ISO 8601
  weeklyGoal INTEGER NOT NULL,       -- 1~7 (주간 목표)
  authMethodGPS BOOLEAN DEFAULT 1,   -- GPS 인증 허용 여부
  authMethodPhoto BOOLEAN DEFAULT 1, -- 사진 인증 허용 여부
  status TEXT CHECK(status IN ('active', 'completed', 'abandoned')), -- 경주 상태
  finalResult TEXT CHECK(finalResult IN ('rabbit', 'turtle', 'tie', 'pending')), -- 결과
  completionRate REAL DEFAULT 0.0,   -- 최종 완료율 (0~100)
  createdAt TEXT NOT NULL,           -- ISO 8601
  updatedAt TEXT NOT NULL
);
```

**주요 필드 설명:**
- `raceId`: UUID 형식 (예: `550e8400-e29b-41d4-a716-446655440000`)
- `status`: 진행 중('active') → 종료('completed') 또는 취소('abandoned')
- `finalResult`: 경주 종료 시에만 채워짐
- `completionRate`: 매일 자정에 계산되어 업데이트

---

### 2️⃣ **authentications** (인증 기록)
```sql
CREATE TABLE authentications (
  authId TEXT PRIMARY KEY,                    -- UUID
  raceId TEXT NOT NULL REFERENCES races(raceId) ON DELETE CASCADE,
  
  -- 인증 타입
  type TEXT NOT NULL CHECK(type IN ('gps', 'photo')), 
  
  -- GPS 인증 데이터
  distance REAL,                              -- 단위: km (예: 3.45)
  duration INTEGER,                           -- 단위: 초 (예: 1234)
  startLat REAL,
  startLng REAL,
  endLat REAL,
  endLng REAL,
  
  -- 사진 인증 데이터
  photoPath TEXT,                             -- 로컬 파일 경로
  photoTimestamp TEXT,                        -- 사진 촬영 시간
  memo TEXT,                                  -- 사용자 메모 (선택)
  
  -- 메타데이터
  timestamp TEXT NOT NULL,                    -- ISO 8601 (인증 시간)
  createdAt TEXT NOT NULL,
  
  -- 유효성
  isValid BOOLEAN DEFAULT 1,                  -- 수동 검증용
  validatedAt TEXT                            -- 검증 시간
);
```

**주요 필드 설명:**
- `type`: 'gps' 또는 'photo'
- GPS인증: `distance`, `duration`, 좌표 정보 필수
- 사진인증: `photoPath`, `memo` (선택)
- `timestamp`: 인증한 시각 (오늘 기준 중복 검증에 사용)

---

### 3️⃣ **daily_progress** (일일 진행상황) - 계산용 뷰
```sql
-- 실제 테이블이 아니라 매일 업데이트되는 계산 결과
CREATE TABLE daily_progress (
  progressId TEXT PRIMARY KEY,
  raceId TEXT NOT NULL REFERENCES races(raceId) ON DELETE CASCADE,
  
  date TEXT NOT NULL,                         -- ISO 8601 (예: 2026-05-11)
  
  -- 사용자 (토끼)
  rabbitDistance REAL DEFAULT 0.0,            -- 누적 거리
  rabbitCount INTEGER DEFAULT 0,              -- 누적 인증 횟수
  
  -- 거북이 (고정 속도)
  turtleExpectedDistance REAL DEFAULT 0.0,    -- 예상 누적 거리
  turtleExpectedCount INTEGER DEFAULT 0,      -- 예상 누적 횟수
  
  -- 진행률
  completionRate REAL DEFAULT 0.0,            -- (rabbitCount / 목표) * 100
  
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  
  UNIQUE(raceId, date)
);
```

---

## 🔄 데이터 흐름

### 1. 경주 시작
```
사용자 입력 → INSERT races → 카운트다운 시작
```

### 2. 러닝 인증
```
사용자 인증 (GPS or 사진)
  ↓
INSERT authentications
  ↓
UPDATE daily_progress (일일 통계)
  ↓
홈 화면에서 프로그레스 바 갱신
```

### 3. 경주 종료 (자동, 매일 자정)
```
현재 시간 > endDate?
  ↓
completionRate 계산 = (총 인증 횟수 / 목표) * 100
  ↓
50% 기준으로 finalResult 판정
  ↓
status = 'completed' 저장
  ↓
결과 화면 표시
```

---

## 📐 계산식

### 진행률 계산
```javascript
completionRate = (인증_횟수 / 목표_횟수) * 100

// 목표 횟수 = weeklyGoal * (경주 기간 / 7)
// 예: 5회/주 × 4주 = 20회 목표
// 실제 인증 10회 → 50%
```

### 거북이 위치 (고정)
```javascript
// 거북이는 매일 일정량 진행
turtleExpectedCount = weeklyGoal * (경과일수 / 7)

// 예: 5회/주, 경과 14일
// turtleExpectedCount = 5 * (14 / 7) = 10회
// 거북이도 50% 위치
```

### 우승자 판정
```javascript
if (completionRate < 50%) {
  finalResult = 'turtle'  // 거북이 승리
} else if (completionRate === 50%) {
  finalResult = 'tie'     // 비김
} else {
  finalResult = 'rabbit'  // 토끼 승리
}
```

---

## 🔑 인덱스 및 최적화

```sql
-- 빠른 조회
CREATE INDEX idx_races_status ON races(status);
CREATE INDEX idx_authentications_raceId ON authentications(raceId);
CREATE INDEX idx_authentications_timestamp ON authentications(timestamp);
CREATE INDEX idx_daily_progress_raceId ON daily_progress(raceId);
CREATE INDEX idx_daily_progress_date ON daily_progress(date);
```

---

## 💾 로컬 저장 전략 (SQLite)

### Expo 사용 시
```typescript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('rabbitVsTurtle.db');

// 초기화
db.execSync(`
  CREATE TABLE IF NOT EXISTS races (
    -- 테이블 정의
  );
  CREATE TABLE IF NOT EXISTS authentications (
    -- 테이블 정의
  );
`);
```

### 사진 저장
```
📁 Local Storage (Expo FileSystem)
└─ rabbitmVsTurtle/
   └─ races/
      └─ {raceId}/
         └─ photos/
            ├─ {authId}_1.jpg
            └─ {authId}_2.jpg

photoPath = "file:///data/user/0/com.app/files/rabbitmVsTurtle/races/{raceId}/photos/{authId}.jpg"
```

---

## 📱 마이그레이션 전략

### Phase 1: 로컬만 사용
- SQLite 저장소만 사용
- 단일 기기 지원

### Phase 2: 클라우드 동기화 (향후)
- Firebase Firestore 또는 Supabase PostgreSQL 추가
- SQLite ↔ Cloud 동기화 엔진
- 데이터 구조는 동일, 네트워크 레이어만 추가

---

## ✅ 체크리스트

- [ ] SQLite 스키마 생성
- [ ] UUID 생성 라이브러리 추가 (`uuid`)
- [ ] 일일 자정 타이머 설정 (native-base Schedule)
- [ ] 백그라운드 작업 설정 (경주 자동 종료)
- [ ] 테스트 데이터 씨드 작성
