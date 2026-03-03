export type ScheduleType = "economic" | "lockup" | "exchange";

export interface HistoricalImpact {
  date: string;
  result: string;
  btcChange: number;
}

export interface EventForecast {
  label: string;
  forecast?: string;
  actual?: string;
  previous: string;
}

export interface EventDetail {
  description: string;
  whyImportant: string;
  aboveExpectation: string;
  belowExpectation: string;
  historicalImpacts: HistoricalImpact[];
  forecast?: EventForecast;
}

export interface ScheduleItem {
  id: string;
  date: string;
  dayLabel: string;
  daysFromNow: number;
  title: string;
  subtitle: string;
  type: ScheduleType;
  importance: "high" | "medium" | "low";
  time?: string;
  tag?: string;
  detail?: EventDetail;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getDayLabel(daysFromNow: number): string {
  if (daysFromNow === 0) return "오늘";
  if (daysFromNow === 1) return "내일";
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return `${DAYS[d.getDay()]}요일`;
}

function getDateStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export const SCHEDULE_ITEMS: ScheduleItem[] = [
  {
    id: "s1",
    date: getDateStr(0),
    dayLabel: getDayLabel(0),
    daysFromNow: 0,
    title: "미국 CPI 발표",
    subtitle: "소비자물가지수 · 시장 변동성 주의",
    type: "economic",
    importance: "high",
    time: "오후 10시 30분",
    detail: {
      description: "CPI(소비자물가지수)는 미국 소비자들이 구매하는 상품과 서비스의 가격 변동을 측정하는 지표예요. 인플레이션의 대표적인 척도로, 연준(Fed)의 금리 결정에 직접적인 영향을 줍니다.",
      whyImportant: "CPI가 예상보다 높으면 연준이 금리를 더 올리거나 오래 유지할 가능성이 커져요. 반대로 낮으면 금리 인하 기대감이 높아지죠. 비트코인을 포함한 위험자산 전체에 큰 영향을 미치는 핵심 지표입니다.",
      aboveExpectation: "인플레이션이 예상보다 높다는 뜻이에요. 연준의 긴축 기조가 유지될 수 있어서 위험자산에는 부담이 될 수 있어요. 다만 시장이 이미 반영했을 수도 있으니 발표 직후 반응을 주의깊게 살펴보세요.",
      belowExpectation: "물가 상승 압력이 줄어들고 있다는 신호예요. 금리 인하 기대감이 커지면서 위험자산에 긍정적으로 작용할 수 있어요. 하지만 너무 낮으면 경기 둔화 우려도 있으니 전체적인 맥락을 함께 봐야 해요.",
      forecast: { label: "CPI (YoY)", forecast: "2.9%", previous: "3.0%" },
      historicalImpacts: [
        { date: "2025.01", result: "예상 상회 (3.0% vs 2.9%)", btcChange: -4.2 },
        { date: "2024.12", result: "예상 부합 (2.7%)", btcChange: 1.8 },
        { date: "2024.11", result: "예상 부합 (2.6%)", btcChange: 0.5 },
        { date: "2024.10", result: "예상 상회 (2.4% vs 2.3%)", btcChange: -2.1 },
        { date: "2024.09", result: "예상 하회 (2.4% vs 2.5%)", btcChange: 5.3 },
      ],
    },
  },
  {
    id: "s1b",
    date: getDateStr(0),
    dayLabel: getDayLabel(0),
    daysFromNow: 0,
    title: "주간 신규실업수당 청구건수 발표",
    subtitle: "고용 시장 건전성 확인",
    type: "economic",
    importance: "medium",
    time: "오후 10시 30분",
    detail: {
      description: "매주 발표되는 신규 실업수당 청구건수는 미국 고용 시장의 건전성을 실시간으로 보여주는 지표예요. 해고가 늘어나면 청구건수가 증가합니다.",
      whyImportant: "고용 시장이 약해지면 연준이 금리를 인하할 가능성이 높아져요. 반대로 고용이 탄탄하면 긴축을 유지할 수 있죠. 매주 나오는 지표라 경제 흐름을 빠르게 파악할 수 있어요.",
      aboveExpectation: "예상보다 실업수당 청구가 많다는 건 고용 시장이 약해지고 있다는 신호예요. 금리 인하 기대로 위험자산에 긍정적일 수 있지만, 경기 침체 우려도 함께 커질 수 있어요.",
      belowExpectation: "고용 시장이 여전히 튼튼하다는 뜻이에요. 경제 체력은 좋지만, 연준이 금리를 높게 유지할 수 있어 단기적으로 위험자산에 부담이 될 수 있어요.",
      forecast: { label: "신규 청구건수", forecast: "21.5만", previous: "21.9만" },
      historicalImpacts: [
        { date: "2025.02", result: "21.9만 (예상 22만)", btcChange: 0.8 },
        { date: "2025.01", result: "22.3만 (예상 21.5만)", btcChange: -1.2 },
        { date: "2024.12", result: "21.1만 (예상 22만)", btcChange: 1.5 },
      ],
    },
  },
  {
    id: "s2",
    date: getDateStr(1),
    dayLabel: getDayLabel(1),
    daysFromNow: 1,
    title: "ARB 토큰 락업 해제",
    subtitle: "약 1.1억 토큰 · 전체 공급량 4.2%",
    type: "lockup",
    importance: "high",
    detail: {
      description: "락업 해제란 일정 기간 거래가 제한되었던 토큰이 시장에 풀리는 걸 말해요. ARB(아비트럼)의 초기 투자자와 팀에게 배분된 토큰 약 1.1억 개가 거래 가능해집니다.",
      whyImportant: "전체 공급량의 4.2%에 해당하는 물량이 한꺼번에 풀리면 매도 압력이 생길 수 있어요. 다만 실제로 모두 팔리는 건 아니고, 시장 분위기에 따라 영향이 달라져요.",
      aboveExpectation: "락업 해제 후 매도 물량이 예상보다 적으면 오히려 불확실성 해소로 가격이 반등할 수 있어요. 보유자들이 장기 홀딩을 선택한 것으로 볼 수 있죠.",
      belowExpectation: "대량 매도가 발생하면 단기적으로 가격 하락 압력이 커질 수 있어요. 거래량과 함께 온체인 데이터에서 이동량을 확인해보면 실제 매도 의지를 가늠할 수 있어요.",
      forecast: { label: "해제 물량", forecast: "1.1억 개 (공급량 4.2%)", previous: "7,500만 개" },
      historicalImpacts: [
        { date: "2024.12", result: "ARB 7,500만 토큰 해제", btcChange: -0.3 },
        { date: "2024.09", result: "ARB 9,200만 토큰 해제", btcChange: -1.8 },
        { date: "2024.06", result: "ARB 1.1억 토큰 해제", btcChange: 0.2 },
      ],
    },
  },
  {
    id: "s3",
    date: getDateStr(2),
    dayLabel: getDayLabel(2),
    daysFromNow: 2,
    title: "빗썸 거래왕 이벤트",
    subtitle: "거래량 상위 유저 대상 경품 지급",
    type: "exchange",
    importance: "medium",
  },
  {
    id: "s4",
    date: getDateStr(3),
    dayLabel: getDayLabel(3),
    daysFromNow: 3,
    title: "FOMC 금리 결정",
    subtitle: "연준 기준금리 발표 · 기자회견 예정",
    type: "economic",
    importance: "high",
    time: "새벽 4시 00분",
    detail: {
      description: "FOMC(연방공개시장위원회)는 미국 연준이 기준금리를 결정하는 회의예요. 연 8회 열리며, 회의 후 금리 결정과 함께 경제 전망도 발표됩니다.",
      whyImportant: "기준금리는 모든 금융시장의 기초예요. 금리가 오르면 돈의 가치가 높아져서 위험자산이 불리해지고, 내리면 유동성이 풍부해져서 비트코인 같은 자산에 긍정적이에요.",
      aboveExpectation: "예상보다 매파적(금리 인상/유지 시사)이면 시장에 실망감이 퍼질 수 있어요. 파월 의장의 기자회견 톤과 점도표(Dot Plot)를 함께 확인하는 게 중요해요.",
      belowExpectation: "예상보다 비둘기파적(금리 인하 시사)이면 시장 전반에 안도 랠리가 올 수 있어요. 특히 비트코인은 유동성 기대에 민감하게 반응하는 경향이 있어요.",
      forecast: { label: "기준금리", forecast: "5.25~5.50%", previous: "5.25~5.50%" },
      historicalImpacts: [
        { date: "2025.01", result: "동결 (5.25~5.50%)", btcChange: 2.1 },
        { date: "2024.12", result: "25bp 인하", btcChange: -3.5 },
        { date: "2024.11", result: "25bp 인하", btcChange: 8.2 },
        { date: "2024.09", result: "50bp 인하", btcChange: 6.4 },
        { date: "2024.07", result: "동결", btcChange: -1.2 },
      ],
    },
  },
  
  {
    id: "s5b",
    date: getDateStr(5),
    dayLabel: getDayLabel(5),
    daysFromNow: 5,
    title: "개인소비지출(PCE) 물가지수 발표",
    subtitle: "연준이 가장 중시하는 인플레이션 지표",
    type: "economic",
    importance: "high",
    time: "오후 10시 30분",
    detail: {
      description: "PCE(개인소비지출) 물가지수는 미국인들의 실제 소비 패턴을 반영한 물가 지표예요. 연준이 CPI보다 더 중요하게 보는 인플레이션 척도입니다.",
      whyImportant: "연준의 물가 목표(2%)가 바로 이 PCE 기준이에요. CPI보다 소비 행태 변화를 잘 반영하기 때문에 통화정책 결정에 가장 큰 영향을 미쳐요.",
      aboveExpectation: "인플레이션이 아직 꺾이지 않았다는 신호로 읽혀요. 연준의 금리 인하가 늦어질 수 있다는 우려가 커지면서 시장이 위축될 수 있어요.",
      belowExpectation: "물가가 안정되고 있다는 강한 신호예요. 금리 인하 시점이 앞당겨질 수 있다는 기대감으로 위험자산에 활력을 줄 수 있어요.",
      historicalImpacts: [
        { date: "2025.01", result: "예상 부합 (2.6%)", btcChange: 2.3 },
        { date: "2024.12", result: "예상 부합 (2.4%)", btcChange: 1.1 },
        { date: "2024.11", result: "예상 상회 (2.3% vs 2.2%)", btcChange: -2.8 },
        { date: "2024.10", result: "예상 하회 (2.1% vs 2.2%)", btcChange: 4.1 },
      ],
    },
  },
  {
    id: "s6",
    date: getDateStr(8),
    dayLabel: getDayLabel(8),
    daysFromNow: 8,
    title: "미국 GDP 성장률 발표",
    subtitle: "2분기 경제성장률 속보치",
    type: "economic",
    importance: "medium",
    time: "오후 10시 30분",
    detail: {
      description: "GDP(국내총생산) 성장률은 미국 경제가 얼마나 성장했는지 보여주는 가장 종합적인 지표예요. 분기별로 속보치 → 수정치 → 확정치 순으로 발표됩니다.",
      whyImportant: "경제 성장이 너무 빠르면 인플레이션 우려가, 너무 느리면 경기 침체 우려가 커져요. '적당히 성장하는' 골디락스 시나리오가 위험자산에 가장 좋아요.",
      aboveExpectation: "경제가 튼튼하다는 뜻이지만, 연준이 금리를 높게 유지할 명분이 될 수 있어요. 시장은 '좋은 소식이 나쁜 소식'으로 받아들일 수 있어요.",
      belowExpectation: "경기 둔화 신호로 금리 인하 기대가 높아질 수 있어요. 다만 너무 급격한 둔화는 경기 침체 공포를 자극할 수 있으니 수치의 정도가 중요해요.",
      historicalImpacts: [
        { date: "2025.01", result: "2.3% (예상 2.6%)", btcChange: 3.2 },
        { date: "2024.10", result: "2.8% (예상 3.0%)", btcChange: 1.5 },
        { date: "2024.07", result: "2.8% (예상 2.0%)", btcChange: -1.8 },
      ],
    },
  },
];

export const SCHEDULE_TYPE_CONFIG: Record<ScheduleType, { label: string; color: string; icon: string }> = {
  economic: { label: "경제지표", color: "#627EEA", icon: "globe" },
  lockup: { label: "락업해제", color: "#FF4757", icon: "unlock" },
  exchange: { label: "거래소", color: "#F7931A", icon: "gift" },
};
