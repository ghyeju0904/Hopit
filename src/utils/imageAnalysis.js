const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * 러닝 앱 스크린샷을 분석해 운동 데이터를 추출합니다.
 * API 키가 없으면 { skipped: true } 반환 (인증 허용).
 * API 오류 시 { error: true, message } 반환 (인증 허용).
 */
export async function analyzeRunningPhoto(base64) {
  if (!API_KEY) {
    return { skipped: true };
  }

  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            inline_data: { mime_type: 'image/jpeg', data: base64 },
          },
          {
            text: `이 이미지가 러닝 앱(나이키런클럽, 스트라바, 애플 건강, 삼성헬스 등)의 운동 결과 화면인지 분석하세요.

JSON만 응답:
{
  "isRunning": true/false,
  "distance": 숫자(km) 또는 null,
  "heartRate": 숫자(bpm) 또는 null,
  "avgSpeed": 숫자(km/h) 또는 null,
  "duration": "MM:SS 또는 HH:MM:SS" 또는 null,
  "confidence": "high"/"medium"/"low",
  "reason": "한 문장 판단 이유"
}`,
          },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`API ${response.status}: ${body}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('응답 파싱 실패');
  return JSON.parse(match[0]);
}

/** isRunning:false && confidence:high 일 때만 인증 차단 */
export function isAnalysisBlocked(result) {
  if (!result || result.skipped || result.error) return false;
  return result.isRunning === false && result.confidence === 'high';
}
