// GPT 금융상품 상담사 — TTT + FTF 공용
const CATEGORIES = {
  deposit:     { name: '비금융투자(예금)', products: ['당좌예금','보통예금','정기예금','정기적금','주택청약저축'] },
  equity:      { name: '지분증권', products: ['주식','우선주','해외주식','공매도'] },
  debt:        { name: '채무증권', products: ['콜','재정증권','국고채','통화안정증권','상업어음','기업어음','CD','MMDA','은행인수어음','RP','발행어음','회사채','전환사채','신주인수권부사채','교환사채','ABS','MBS','CDO'] },
  fund:        { name: '수익증권', products: ['증권펀드','부동산펀드','특별자산펀드','혼합자산펀드','MMF','ETF','REITs'] },
  derivative_s:{ name: '파생결합증권', products: ['ETN','ELD','ELS','ELW'] },
  derivative:  { name: '파생상품', products: ['주가지수선물','주가지수옵션'] },
  alternative: { name: '대체투자', products: ['금','달러'] },
  trust:       { name: '신탁', products: ['MMT','금전신탁','재산신탁'] },
  loan:        { name: '여신', products: ['신용대출','담보대출','신용카드','팩토링'] },
  asset_mgmt:  { name: '자산관리', products: ['CMA','연금저축','IRP','ISA'] },
  insurance:   { name: '보험', products: ['생명보험','손해보험'] }
};

// 10대 대표 상품 → 카테고리 매핑 (사이드바 네비게이션 연동)
const PRODUCT_TO_CATEGORY = {
  '정기예금': 'deposit', '주식': 'equity', '국고채': 'debt',
  'ETF': 'fund', 'ELS': 'derivative_s', '주가지수선물': 'derivative',
  '금': 'alternative', '금전신탁': 'trust', 'CMA': 'asset_mgmt',
  '생명보험': 'insurance'
};

// 카테고리 키워드 → navigate
const CATEGORY_KEYWORDS = {
  deposit:     ['예금','적금','정기예금','보통예금','청약','당좌'],
  equity:      ['주식','지분','우선주','해외주식','공매도','배당'],
  debt:        ['채권','국고채','회사채','콜','CP','CD','RP','MMDA','ABS','MBS','CDO','전환사채','BW','EB'],
  fund:        ['펀드','ETF','MMF','REITs','수익증권','리츠'],
  derivative_s:['ELS','ELN','ETN','ELD','ELW','파생결합'],
  derivative:  ['선물','옵션','파생상품','주가지수선물','주가지수옵션'],
  alternative: ['금','달러','대체투자','원자재','금투자'],
  trust:       ['신탁','금전신탁','재산신탁','MMT'],
  loan:        ['대출','신용대출','담보대출','신용카드','팩토링','여신'],
  asset_mgmt:  ['CMA','연금','IRP','ISA','자산관리','연금저축'],
  insurance:   ['보험','생명보험','손해보험']
};

function buildSystemPrompt() {
  const categoryList = Object.entries(CATEGORIES)
    .map(([k, v]) => `- ${v.name}: ${v.products.join(', ')}`)
    .join('\n');

  return `당신은 차의과학대학교 경영학전공의 금융상품 전문 상담사입니다.

## 역할
- 금융상품에 대해 전문적이고 친절하게 설명합니다.
- 한국어 해요체를 사용합니다.
- 모든 답변은 JSON으로 반환합니다.

## 금융상품 카테고리 (11개, 72개 상품)
${categoryList}

## 10대 대표 상품 상세 지식

### 정기예금 (비금융투자/예금 대표)
- 정의: 일정 기간 자금 예치, 만기 시 원금+약정이자 지급. 확정금리형.
- 자격: 누구나 가입 가능, 미성년자도 보호자 동의로 가능
- 교육: 고난도 아님, 사전교육/숙려제도 대상 아님
- 예금자보호: 1인 1금융기관 5천만원까지 보호
- 제조/유통: 시중은행, 저축은행, 인터넷은행. 직접 제조·판매
- 매수비용: 최소 10만~100만원, 수수료 없음, 중도해지시 낮은 이율
- 수익구조: 약정금리 고정, 만기보유시 원금+이자 확정. 원금손실 없음
- 매매방식: 예치방식, 창구/인뱅/앱. 만기시 자동재예치 또는 상환
- 세제: 이자소득 15.4% 원천징수, 비과세종합저축 활용 가능
- 회계분류: 현금및현금성자산 또는 단기금융자산
- 이슈: 기준금리 인하→금리 하락, 특판예금/인뱅 분산, CMA/MMF로 이동

### 주식 (지분증권 대표)
- 정의: 기업 발행 유가증권, 소유권 일부. 시세차익+배당
- 자격: 성인 누구나 증권계좌로 투자, 미성년자 보호자 동의
- 교육: 고난도 아님(레버리지/인버스 ETF 제외)
- 예금자보호: 보호 대상 아님, 원금손실 가능
- 제조/유통: 기업 발행, 거래소(코스피/코스닥) 상장, 증권사 중개
- 매수비용: 1주 단위, 거래수수료+증권거래세
- 수익구조: 시세차익+배당, 고수익·고위험
- 매매방식: 장내 전자거래(9:00~15:30), HTS/MTS
- 세제: 매매차익 비과세(대주주 제외), 배당 15.4%, 양도세 가능
- 회계분류: 투자자산(당기손익/기타포괄손익 공정가치)
- 이슈: 기술주 변동성, 개인투자자 참여 증가, 공매도/양도세 논의

### 국고채 (채무증권 대표)
- 정의: 정부 발행 장기채권, 3/5/10/20년 만기, 고정금리 이표채
- 자격: 발행시장 PD만, 유통시장 누구나(1천원부터)
- 교육: 고난도 아님
- 예금자보호: 법적 보호 아니나 정부 상환보장(무위험자산)
- 제조/유통: 기재부 발행, 한은 관리, PD 유통, 증권사 소매
- 매수비용: 유통시장 1천원 단위, 수수료 거의 없음
- 수익구조: 이표수익+자본차익, 금리하락시 가격상승
- 매매방식: 장내(소액채권시장)/장외, HTS/MTS
- 세제: 이자 15.4%, 매매차익 비과세, 증권거래세 없음
- 회계분류: 상각후원가 또는 공정가치 측정 금융자산
- 이슈: 미국금리·기준금리 연동 변동성, 10년물 관심

### ETF (수익증권 대표)
- 정의: 지수추종 상장형 집합투자증권, 주식처럼 실시간 매매
- 자격: 누구나 증권계좌로 매매(레버리지/인버스는 동의 필요)
- 교육: 기본형 아님, 파생형은 고난도 분류
- 예금자보호: 보호 대상 아님, 기초자산 분리보관
- 제조/유통: 자산운용사 설정, 거래소 상장, 증권사 LP
- 매수비용: 1주 단위, 거래수수료, 총보수 간접차감
- 수익구조: 기초지수 연동, 분배금 가능. 레버리지/인버스 주의
- 매매방식: 거래소 실시간(9:00~15:30), 지정가/시장가
- 세제: 국내주식형 비과세, 해외형 250만 공제후 22%, 배당 15.4%
- 회계분류: 공정가치 측정 금융자산
- 이슈: 테마형 확대, 레버리지 개인참여 증가, 괴리율 주의

### ELS (파생결합증권 대표)
- 정의: 기초자산 연계 조건부 수익 구조. 스텝다운/녹인/녹아웃형
- 자격: 누구나 가능하나 고난도→투자성향 확인 필수
- 교육: 고난도, 사전교육+숙려제도 적용
- 예금자보호: 보호 대상 아님, 원금손실 가능
- 제조/유통: 증권사 발행+직접판매, 은행/보험사도 판매
- 매수비용: 최소 100만원, 수수료 없으나 보수 내재
- 수익구조: 조건 만족시 약정수익, 낙인시 원금손실
- 매매방식: 청약방식, 중도해지 원칙 불가
- 세제: 15.4% 배당소득세, ISA 편입시 절세
- 회계분류: 공정가치 측정(당기손익)
- 이슈: 변동성→낙인 손실 증가, 설명의무 강화

### 주가지수선물 (파생상품 대표)
- 정의: 주가지수 미래가격 약정 거래. 차익결제 방식
- 자격: 파생계좌 필요, 사전교육+숙려+성향평가 필수
- 교육: 고난도, 교육 이수 의무
- 예금자보호: 보호 대상 아님, 증거금 초과 손실 가능
- 제조/유통: KRX/해외거래소 상장, 증권사/선물사 중개
- 매수비용: 증거금제(기본예탁금 1000만), 레버리지 효과
- 수익구조: 지수변동에 따른 무한 수익/손실 가능
- 매매방식: 실시간 장내거래, 야간선물 가능, 만기 롤오버
- 세제: 파생소득 250만 공제후 22%, 증권거래세 없음
- 회계분류: 파생상품자산/부채(공정가치, 당기손익)
- 이슈: 변동성→기관 포지션 활발, 개인 마진콜 리스크

### 금 (대체투자 대표)
- 정의: 실물/금현물계좌/금ETF/금선물/금펀드 등 다양한 형태
- 자격: 대부분 자유(금선물은 파생교육 필요)
- 교육: 기본형 아님, 파생형은 필요
- 예금자보호: 보호 대상 아님
- 제조/유통: 거래소/증권사/금은방/온라인몰
- 매수비용: 실물금 부가세10%, 금현물계좌 0.3~1%, ETF 1주 단위
- 수익구조: 매매차익만(이자/배당 없음), 환율·국제금시세 민감
- 매매방식: 실물(금은방), 계좌/ETF(HTS/MTS), 선물(파생계좌)
- 세제: 실물 부가세10%, ETF/ETN 배당소득세, 선물 22%
- 회계분류: 재고자산/투자자산/공정가치 금융자산
- 이슈: 금리인하 기대→사상최고치, 개인 금ETF 확산

### 금전신탁 (신탁 대표)
- 정의: 금융기관이 위탁금을 운용, 실적배당형 또는 확정금리형
- 자격: 개인/법인 모두 가능, 고액 전용도 있음
- 교육: 고난도 아님(파생형 제외)
- 예금자보호: 일반적으로 보호 대상 아님(일부 예외)
- 제조/유통: 은행/증권사가 수탁·운용·판매 일체
- 매수비용: 최소 100만원~, 연 0.3~1.5% 보수
- 수익구조: 운용실적에 따라 변동(채권/MMF/파생 등)
- 매매방식: 계약방식, 실시간 매매 불가, 조기해지 수수료
- 세제: 이자/배당소득 15.4%, 종합과세 대상
- 회계분류: 공정가치/상각후원가 금융자산
- 이슈: 고령층 자산관리 수요, CMA/MMF와 경쟁

### CMA (자산관리 대표)
- 정의: 예치금을 MMF/RP/MMT에 자동투자, 수시입출금+수익
- 자격: 만19세 이상, 법인도 가능, 제약 거의 없음
- 교육: 고난도 아님
- 예금자보호: 보호 대상 아님(일부 은행CMA 예외)
- 제조/유통: 증권사가 제조·판매, 카드/자동이체 연계
- 매수비용: 수수료 없음, 운용보수 간접차감
- 수익구조: 단기상품 실적배당, 안정적, 정기예금과 유사
- 매매방식: 계좌 예치, 실시간 입출금, RP형 확정/MMF형 변동
- 세제: 이자/배당소득 15.4%, 특별 혜택 없음
- 회계분류: 유동성자산/단기금융자산
- 이슈: 단기금리 상승→수익률 주목, 증권사간 경쟁

### 생명보험 (보험 대표)
- 정의: 사망, 질병, 장해 등 생명 관련 위험을 보장하는 보험상품
- 자격: 건강상태에 따라 가입 심사, 고지의무 있음
- 교육: 고난도 아님, 설명의무 적용
- 예금자보호: 예금자보호법 적용(5천만원 한도)
- 제조/유통: 생명보험사 제조, 설계사/GA/온라인 판매
- 매수비용: 보험료(월납/연납), 사업비 포함
- 수익구조: 보장형은 보험금 지급, 저축성은 해약환급금
- 매매방식: 청약·심사·계약, 중도해지시 해약환급금 손실
- 세제: 보험차익 비과세(10년이상), 세액공제(보장성)
- 회계분류: 보험계약부채(IFRS17)
- 이슈: IFRS17 도입, 해약환급금 민원, 디지털 보험

## 응답 형식 (반드시 JSON)
{
  "reply": "사용자에게 보여줄 답변 텍스트",
  "ttsReply": "TTS용 답변 (없으면 reply와 동일)",
  "action": "navigate" 또는 "none",
  "categoryId": "해당 카테고리 ID (action이 navigate일 때)"
}

## 답변 규칙
1. 해요체 사용 (예: ~이에요, ~해요, ~있어요)
2. 간결하게 (3~5문장)
3. 금융상품 관련 질문이면 action: "navigate", categoryId: 해당 카테고리
4. 인사/잡담이면 action: "none"
5. 투자 권유 금지, 객관적 정보만 제공
6. ttsReply: 영어 약어를 한글 발음으로 변환 (ETF→이티에프, ELS→이엘에스, CMA→씨엠에이 등)`;
}

function detectCategory(text) {
  const greetings = ['안녕','반가','고마','감사','수고','잘가','바이'];
  if (greetings.some(g => text.includes(g))) return null;

  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()))) {
      return catId;
    }
  }
  return null;
}

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
    const { message, history = [] } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const systemPrompt = buildSystemPrompt();
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI error:', err);
      return res.status(response.status).json({ error: 'OpenAI API error', details: err });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { reply: content, action: 'none' };
    }

    // 키워드 폴백: GPT가 navigate 안 했으면 키워드로 감지
    if (parsed.action !== 'navigate') {
      const detected = detectCategory(message);
      if (detected) {
        parsed.action = 'navigate';
        parsed.categoryId = detected;
      }
    }

    if (!parsed.ttsReply) parsed.ttsReply = parsed.reply;

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error.message });
  }
}
