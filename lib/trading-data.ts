export interface DayTradingData {
  date: string;
  profit: number;
  topCoin: string;
  tradeCount: number;
}

export interface TradingJournalEntry {
  date: string;
  mood: number;
  score: number;
  technicalTags: string[];
  reasonTags: string[];
  memo: string;
}

export const MOOD_OPTIONS = [
  { value: 5, label: "최고", icon: "trending-up" },
  { value: 4, label: "좋음", icon: "smile" },
  { value: 3, label: "보통", icon: "minus" },
  { value: 2, label: "나쁨", icon: "frown" },
  { value: 1, label: "최악", icon: "trending-down" },
] as const;

export const MOOD_COLORS: Record<number, string> = {
  5: "#00DC82",
  4: "#627EEA",
  3: "#F7931A",
  2: "#FF6B9D",
  1: "#FF4757",
};

export const TECHNICAL_TAGS = [
  "RSI 과매수", "RSI 과매도", "거래량 폭발",
  "골든크로스", "데드크로스", "고베타 진입",
  "지지선 반등", "저항선 돌파",
];

export const REASON_TAGS = [
  "뇌동매매", "물타기", "손절", "익절", "FOMO",
  "원칙준수", "데이터", "뉴스", "저점매수", "고점매도",
];

const COINS = ["btc", "eth", "sol", "xrp", "doge", "bnb"];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function getMonthTradingData(year: number, month: number): DayTradingData[] {
  const rng = seededRandom(year * 100 + month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const data: DayTradingData[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month, d).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (rng() > 0.3) continue;
    }
    if (rng() > 0.65) continue;

    const profit = Math.round((rng() - 0.45) * 500) * 10000;
    const topCoin = COINS[Math.floor(rng() * COINS.length)];
    const tradeCount = Math.floor(rng() * 8) + 1;

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    data.push({ date: dateStr, profit, topCoin, tradeCount });
  }

  return data;
}

export function formatProfitShort(n: number): string {
  const abs = Math.abs(n);
  const sign = n >= 0 ? "+" : "-";
  if (abs >= 100000000) {
    const eok = Math.floor(abs / 100000000);
    return `${sign}${eok}억`;
  }
  if (abs >= 10000) {
    const man = Math.floor(abs / 10000);
    return `${sign}${man}만`;
  }
  return `${sign}${abs.toLocaleString()}`;
}

export const COIN_ICONS: Record<string, { icon: string; color: string; lib: "material" | "feather" }> = {
  btc: { icon: "bitcoin", color: "#F7931A", lib: "material" },
  eth: { icon: "ethereum", color: "#627EEA", lib: "material" },
  sol: { icon: "zap", color: "#00B8D9", lib: "feather" },
  xrp: { icon: "repeat", color: "#FFD93D", lib: "feather" },
  doge: { icon: "smile", color: "#C3A634", lib: "feather" },
  bnb: { icon: "hexagon", color: "#F0B90B", lib: "feather" },
};
