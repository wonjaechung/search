export interface Asset {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  iconColor: string;
  price: string;
  currency: string;
  change24h: number;
  category: string[];
}

export const ASSETS: Asset[] = [
  { id: "btc", name: "비트코인", symbol: "BTC", icon: "bitcoin", iconColor: "#F7931A", price: "98,000,000", currency: "₩", change24h: -0.50, category: ["global", "major", "crypto"] },
  { id: "eth", name: "이더리움", symbol: "ETH", icon: "ethereum", iconColor: "#627EEA", price: "4,500,000", currency: "₩", change24h: -0.10, category: ["global", "major", "crypto"] },
  { id: "sp500", name: "S&P 500", symbol: "SP500", icon: "trending-up", iconColor: "#00DC82", price: "5,477.90", currency: "$", change24h: -0.16, category: ["global", "index"] },
  { id: "nasdaq", name: "나스닥", symbol: "NASDAQ", icon: "bar-chart-2", iconColor: "#A855F7", price: "19,700.43", currency: "$", change24h: -0.26, category: ["global", "index"] },
  { id: "kospi", name: "코스피", symbol: "KOSPI", icon: "activity", iconColor: "#FF6B9D", price: "2,774.40", currency: "₩", change24h: -0.70, category: ["global", "index"] },
  { id: "sol", name: "솔라나", symbol: "SOL", icon: "zap", iconColor: "#00B8D9", price: "245,000", currency: "₩", change24h: 1.20, category: ["theme", "major", "crypto"] },
  { id: "xrp", name: "리플", symbol: "XRP", icon: "repeat", iconColor: "#FFD93D", price: "850", currency: "₩", change24h: 0.80, category: ["theme", "crypto"] },
  { id: "bnb", name: "바이낸스코인", symbol: "BNB", icon: "hexagon", iconColor: "#F0B90B", price: "870,000", currency: "₩", change24h: 1.50, category: ["major", "crypto"] },
  { id: "gold", name: "금", symbol: "GOLD", icon: "award", iconColor: "#FFD700", price: "3,120.50", currency: "$", change24h: 0.32, category: ["global", "commodity"] },
  { id: "doge", name: "도지코인", symbol: "DOGE", icon: "smile", iconColor: "#C3A634", price: "420", currency: "₩", change24h: 2.10, category: ["theme", "crypto"] },
];

export type Period = "24H" | "1W" | "1M" | "1Y";

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PERIOD_POINTS: Record<Period, number> = {
  "24H": 48,
  "1W": 56,
  "1M": 60,
  "1Y": 52,
};

const VOLATILITY: Record<string, number> = {
  btc: 1.2, eth: 1.5, sp500: 0.5, nasdaq: 0.7, kospi: 0.8,
  sol: 2.0, xrp: 1.8, bnb: 1.3, gold: 0.4, doge: 2.5,
};

export function getChartData(assetId: string, period: Period): number[] {
  const points = PERIOD_POINTS[period];
  const hash = assetId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const periodHash = period.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = seededRandom(hash * 100 + periodHash);
  const vol = VOLATILITY[assetId] || 1.0;

  const data: number[] = [0];
  for (let i = 1; i < points; i++) {
    const prev = data[i - 1];
    const change = (rng() - 0.48) * vol;
    data.push(parseFloat((prev + change).toFixed(2)));
  }
  return data;
}

export function getTimeLabels(period: Period): string[] {
  const now = new Date();
  const points = PERIOD_POINTS[period];
  const labels: string[] = [];

  for (let i = 0; i < points; i++) {
    const d = new Date(now);
    if (period === "24H") {
      d.setMinutes(d.getMinutes() - (points - 1 - i) * 30);
      labels.push(`${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`);
    } else if (period === "1W") {
      d.setHours(d.getHours() - (points - 1 - i) * 3);
      labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    } else if (period === "1M") {
      d.setDate(d.getDate() - (points - 1 - i));
      labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    } else {
      d.setDate(d.getDate() - (points - 1 - i) * 7);
      labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
  }
  return labels;
}

export interface PresetComparison {
  id: string;
  title: string;
  subtitle: string;
  assetIds: string[];
  badge?: string;
  isCustom?: boolean;
}

export const PRESET_COMPARISONS: PresetComparison[] = [
  {
    id: "btc-vs-eth",
    title: "비트코인 vs 이더리움",
    subtitle: "이더리움이 비트코인을 이길 수 있을까?",
    assetIds: ["btc", "eth"],
    badge: "HOT",
  },
  {
    id: "top1-picks",
    title: "고수들의 선택",
    subtitle: "수익률 상위 1% 고수들이 매수 중",
    assetIds: ["sol", "btc", "xrp"],
    badge: "HOT",
  },
  {
    id: "whale-picks",
    title: "큰손들의 선택",
    subtitle: "자산 상위 1% 큰손들이 담는 종목",
    assetIds: ["btc", "eth", "bnb"],
    badge: "NEW",
  },
  {
    id: "top5-gains",
    title: "상승률 TOP 5",
    subtitle: "최근 가장 많이 오른 코인은?",
    assetIds: ["sol", "xrp", "bnb", "doge", "eth"],
    badge: "NEW",
  },
  {
    id: "popular-top5",
    title: "인기검색 TOP 5",
    subtitle: "지금 가장 많이 검색되는 종목",
    assetIds: ["btc", "eth", "xrp", "sol", "doge"],
    badge: "HOT",
  },
  {
    id: "my-top5",
    title: "보유종목 TOP 5",
    subtitle: "내 포트폴리오 수익률 한눈에",
    assetIds: ["btc", "eth", "sol", "xrp", "bnb"],
  },
];
