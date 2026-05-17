/**
 * Hopit 개발 일지 → Notion 자동 동기화
 *
 * 환경 변수:
 *   NOTION_TOKEN   - Notion Integration 토큰
 *   NOTION_PAGE_ID - 업데이트할 Notion 페이지 ID
 *   NOTION_LOG_PAGE_ID - 개발 현황 하위 페이지 ID
 */

const https = require('https');
const { execSync } = require('child_process');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_LOG_PAGE_ID = process.env.NOTION_LOG_PAGE_ID || '363ef9f4ad0d81e0a459eb9ee7f18d53';

if (!NOTION_TOKEN) {
  console.error('❌ NOTION_TOKEN 환경변수가 없습니다.');
  process.exit(1);
}

// ── Notion API 헬퍼 ──────────────────────────────────────────────

function notionRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: 'api.notion.com',
        path,
        method,
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
        }
      },
      (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch { reject(new Error('JSON parse error: ' + raw)); }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ── Git 정보 수집 ────────────────────────────────────────────────

function getGitLog() {
  try {
    return execSync(
      'git log --since="00:00 today" --format="%h %s" --no-merges',
      { encoding: 'utf8', cwd: process.cwd() }
    ).trim();
  } catch { return ''; }
}

function getChangedFiles() {
  try {
    return execSync(
      'git diff --name-only HEAD~1 HEAD 2>/dev/null || echo ""',
      { encoding: 'utf8', cwd: process.cwd() }
    ).trim();
  } catch { return ''; }
}

function getFileStats() {
  try {
    const result = execSync(
      'git diff --shortstat HEAD~1 HEAD 2>/dev/null || echo "변경 없음"',
      { encoding: 'utf8', cwd: process.cwd() }
    ).trim();
    return result || '변경 없음';
  } catch { return '변경 없음'; }
}

// ── Notion 블록 생성 ─────────────────────────────────────────────

function makeHeading(text, level = 2) {
  return {
    type: `heading_${level}`,
    [`heading_${level}`]: {
      rich_text: [{ type: 'text', text: { content: text } }]
    }
  };
}

function makeParagraph(text) {
  return {
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: text || '(없음)' } }]
    }
  };
}

function makeCode(text, language = 'plain text') {
  return {
    type: 'code',
    code: {
      rich_text: [{ type: 'text', text: { content: text || '(없음)' } }],
      language
    }
  };
}

function makeDivider() {
  return { type: 'divider', divider: {} };
}

// ── 메인 ────────────────────────────────────────────────────────

async function main() {
  const today = new Date().toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  const commits = getGitLog();
  const changedFiles = getChangedFiles();
  const stats = getFileStats();

  console.log(`📅 날짜: ${today}`);
  console.log(`📝 커밋: ${commits || '없음'}`);

  // 1. 오늘 날짜 하위 페이지 생성
  const newPage = await notionRequest('POST', '/v1/pages', {
    parent: { page_id: NOTION_LOG_PAGE_ID },
    properties: {
      title: {
        title: [{ type: 'text', text: { content: `📅 ${today} 개발 일지` } }]
      }
    },
    children: [
      makeHeading('오늘의 커밋', 2),
      commits
        ? makeCode(commits, 'plain text')
        : makeParagraph('오늘 커밋 없음'),

      makeDivider(),
      makeHeading('변경된 파일', 2),
      changedFiles
        ? makeCode(changedFiles, 'plain text')
        : makeParagraph('변경 없음'),

      makeDivider(),
      makeHeading('변경 통계', 2),
      makeParagraph(stats),

      makeDivider(),
      makeHeading('현재 진행 현황', 2),
      makeParagraph('✅ 완료: 8개 화면, DB(SQLite+Web), 디자인 시스템, 재사용 컴포넌트 6개, 픽셀 스프라이트, 애니메이션'),
      makeParagraph('🚧 진행 중: Expo 웹 실행 안정화 (Platform 분기 처리)'),
      makeParagraph('📋 남은 것: GPS/사진 기능 검증, HopInput/HopModal, 애니메이션 추가, 에러 처리')
    ]
  });

  if (newPage.id) {
    console.log(`✅ Notion 페이지 생성 완료: ${newPage.url}`);
  } else {
    console.error('❌ 페이지 생성 실패:', JSON.stringify(newPage, null, 2));
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ 스크립트 오류:', err.message);
  process.exit(1);
});
