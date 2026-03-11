// OpenAI Realtime API — ephemeral token 발급 (STS 모드용)
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }

  try {
    const { instructions } = req.body || {};

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
        voice: 'alloy',
        modalities: ['audio', 'text'],
        instructions: instructions || getDefaultInstructions(),
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Realtime session error:', err);
      return res.status(response.status).json({ error: 'Failed to create realtime session', details: err });
    }

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      client_secret: data.client_secret,
      session_id: data.id
    });
  } catch (error) {
    console.error('Realtime token error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function getDefaultInstructions() {
  return `당신은 차의과학대학교 경영학전공의 금융상품 전문 상담사입니다.

## 역할
- 금융상품에 대해 전문적이고 친절하게 설명합니다
- 한국어로 대화합니다 (해요체 사용)
- 11개 카테고리, 72개 금융상품에 대한 지식을 바탕으로 답변합니다

## 카테고리
비금융투자(예금), 지분증권, 채무증권, 수익증권, 파생결합증권, 파생상품, 대체투자, 신탁, 여신, 자산관리, 보험

## 답변 규칙
- 각 상품의 11개 분석 항목(정의, 자격, 교육, 예금자보호, 제조/유통사, 매수비용, 수익구조, 매매방식, 세제, 회계분류, 이슈)을 기반으로 답변
- 간결하고 이해하기 쉽게 설명
- 확실하지 않은 정보는 "확인이 필요해요"라고 안내
- 투자 권유는 하지 않고, 객관적 정보만 제공`;
}
