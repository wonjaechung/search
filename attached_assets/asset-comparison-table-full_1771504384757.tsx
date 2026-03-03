'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, X, Plus, Search, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

// This is a simplified version - you can expand with full filter functionality
// For now, I'll add the essential filter UI and basic filtering logic

const assetsData = [
  { rank: 1, name: '비트코인', ticker: 'BTC', today: 5.12, week: 12.5, month: 23.9, marketCap: '1,382조', circulatingSupply: '19,713,934 BTC', supplyRatio: 93.8, img: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=032', marketCapDominance: '52.5%', athPrice: '101,348,000원', athDate: '2024년 3월 14일', rsi: 65 },
  { rank: 2, name: '이더리움', ticker: 'ETH', today: 3.88, week: 10.1, month: 18.43, marketCap: '488조', circulatingSupply: '120,073,398 ETH', supplyRatio: 100, img: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=032', marketCapDominance: '18.5%', athPrice: '5,985,000원', athDate: '2021년 11월 10일', rsi: 58 },
  { rank: 3, name: '리플', ticker: 'XRP', today: -1.23, week: -5.67, month: 2.11, marketCap: '32조', circulatingSupply: '55,618,185,850 XRP', supplyRatio: 55.6, img: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg?v=032', marketCapDominance: '1.2%', athPrice: '4,925원', athDate: '2018년 1월 4일', rsi: 42 },
  { rank: 4, name: '솔라나', ticker: 'SOL', today: 8.4, week: 15.2, month: 35.1, marketCap: '88조', circulatingSupply: '462,135,937 SOL', supplyRatio: 80.5, img: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=032', marketCapDominance: '3.3%', athPrice: '335,000원', athDate: '2021년 11월 7일', rsi: 72 },
  { rank: 5, name: '도지코인', ticker: 'DOGE', today: -2.5, week: 1.8, month: -8.9, marketCap: '22조', circulatingSupply: '144,855,296,383 DOGE', supplyRatio: 100, img: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=032', marketCapDominance: '0.8%', athPrice: '930원', athDate: '2021년 5월 8일', rsi: 35 },
  { rank: 6, name: '스택스', ticker: 'STX', today: 7.2, week: 18.1, month: 40.2, marketCap: '4.5조', circulatingSupply: '1,469,339,187 STX', supplyRatio: 80.7, img: 'https://cryptologos.cc/logos/stacks-stx-logo.svg?v=032', marketCapDominance: '0.17%', athPrice: '5,000원', athDate: '2024년 4월 1일', rsi: 68 },
  { rank: 7, name: '이뮤터블엑스', ticker: 'IMX', today: -3.1, week: -1.2, month: 5.5, marketCap: '3.2조', circulatingSupply: '1,507,875,589 IMX', supplyRatio: 75.4, img: 'https://cryptologos.cc/logos/immutable-x-imx-logo.svg?v=032', marketCapDominance: '0.12%', athPrice: '4,500원', athDate: '2021년 11월 10일', rsi: 28 },
  { rank: 8, name: '수이', ticker: 'SUI', today: 2.5, week: 8.9, month: 22.3, marketCap: '2.8조', circulatingSupply: '2,339,197,381 SUI', supplyRatio: 23.4, img: 'https://cryptologos.cc/logos/sui-sui-logo.svg?v=032', marketCapDominance: '0.11%', athPrice: '2,800원', athDate: '2024년 3월 27일', rsi: 45 },
  { rank: 9, name: '아비트럼', ticker: 'ARB', today: 3.2, week: 8.1, month: 12.5, marketCap: '2.7조', circulatingSupply: '3,231,588,116 ARB', supplyRatio: 32.3, img: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=032', marketCapDominance: '0.10%', athPrice: '3,200원', athDate: '2024년 1월 12일', rsi: 52 },
  { rank: 10, name: '렌더', ticker: 'RNDR', today: 7.8, week: 15.2, month: 22.0, marketCap: '2.5조', circulatingSupply: '388,646,672 RNDR', supplyRatio: 73.0, img: 'https://cryptologos.cc/logos/render-rndr-logo.svg?v=032', marketCapDominance: '0.09%', athPrice: '18,000원', athDate: '2024년 3월 17일', rsi: 62 },
];

const deepDiveData = {
  BTC: { internalCirculation: '21,345 BTC', internalCirculationValue: '2조 1,345억원', circulationChange: 0.15, netDeposit24h: '120억원', holderCount: 1234567, tradingVolume: '1.2조원', whaleHoldingRatio: 18, whaleTradingRatio: 35, buyOrderPressure: 62, sellOrderPressure: 38, tradingVolumeRank: 1, holderChange: '+1,234명', netDepositRank: 3, holderRank: 2, quarterlyReview: [] },
  ETH: { internalCirculation: '250,123 ETH', internalCirculationValue: '1조 2,506억원', circulationChange: -0.05, netDeposit24h: '-80억원', holderCount: 987654, tradingVolume: '8,500억원', whaleHoldingRatio: 12, whaleTradingRatio: 28, buyOrderPressure: 55, sellOrderPressure: 45, tradingVolumeRank: 2, holderChange: '+876명', netDepositRank: 12, holderRank: 3, quarterlyReview: [] },
  SOL: { internalCirculation: '5,123,456 SOL', internalCirculationValue: '1조 1,783억원', circulationChange: 0.8, netDeposit24h: '550억원', holderCount: 456789, tradingVolume: '6,200억원', whaleHoldingRatio: 25, whaleTradingRatio: 42, buyOrderPressure: 48, sellOrderPressure: 52, tradingVolumeRank: 4, holderChange: '+2,345명', netDepositRank: 1, holderRank: 5, quarterlyReview: [] },
};

type Asset = (typeof assetsData)[0] & { deepDive: (typeof deepDiveData)['BTC']; rsi?: number };
type SortKey = keyof Asset | 'holderCount' | 'influenceScore' | 'tradingVolume' | 'marketCap' | 'netDeposit24h' | 'rsi';

type Filter = {
  id: string;
  type: 'market' | 'category' | 'mcap' | 'change' | 'trend' | 'rsi' | 'volume' | 'feargreed' | 'ma' | 'buysurge' | 'deposit' | 'whaletrade' | 'profit' | 'beta' | 'volatility';
  label: string;
  value: string;
  rawValue?: string | string[] | number[] | Record<string, any>;
};

type FilterOption = {
  id: string;
  name: string;
  description?: string;
  type: 'radio' | 'checkbox' | 'range' | 'custom';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

const filterOptions: Record<string, FilterOption> = {
  mcap: {
    id: 'mcap',
    name: '시가총액',
    description: '원하는 시가총액 범위를 선택하세요',
    type: 'range',
    min: 0,
    max: 100000000000000,
    step: 1000000000,
    unit: '원',
  },
  change: {
    id: 'change',
    name: '가격등락률',
    description: '기준 날짜와 등락률을 설정하세요',
    type: 'custom',
  },
  category: {
    id: 'category',
    name: '카테고리',
    description: '가상자산 카테고리를 선택하세요',
    type: 'checkbox',
    options: [
      { value: 'ai', label: '인공지능(AI)' },
      { value: 'l2', label: '레이어2' },
      { value: 'game', label: '게임' },
      { value: 'defi', label: '디파이' },
      { value: 'rwa', label: '실물자산(RWA)' },
    ],
  },
  rsi: {
    id: 'rsi',
    name: '과매수/과매도',
    description: 'RSI는 코인의 과매수 또는 과매도 상태를 나타내는 지표예요. RSI가 70 이상이면 과매수로 매도 타이밍을 고려해볼 수 있고, 30 이하면 과매도로 매수 기회로 볼 수 있어요.',
    type: 'custom',
  },
};

const filterGroups = [
  {
    id: 'main',
    name: '주요정보',
    items: [
      { id: 'category', name: '섹터' },
      { id: 'mcap', name: '시가총액' },
    ],
  },
  {
    id: 'price',
    name: '시세정보',
    items: [
      { id: 'change', name: '가격등락률' },
    ],
  },
  {
    id: 'technical',
    name: '기술적분석',
    items: [
      { id: 'rsi', name: '과매수/과매도' },
    ],
  },
];

const defaultAssets: Asset[] = assetsData.map(asset => ({
  ...asset,
  deepDive: deepDiveData[asset.ticker as keyof typeof deepDiveData] || deepDiveData.BTC
}));

function formatPercentage(value: number) {
  if (value === null || value === undefined) return '-';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

const parseCurrency = (valueStr: string): number => {
  const num = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
  if (valueStr.includes('조')) return num * 1_0000_0000_0000;
  if (valueStr.includes('억')) return num * 1_0000_0000;
  if (valueStr.includes('만')) return num * 1_0000;
  return num;
}

const parseMarketCap = (marketCapStr: string): number => {
  if (!marketCapStr || marketCapStr === '-') return 0;
  const cleaned = marketCapStr.replace(/,/g, '');
  let number = parseFloat(cleaned.replace(/[조억만원]/g, '')) || 0;
  
  if (cleaned.includes('조')) {
    number *= 1000000000000;
  } else if (cleaned.includes('억')) {
    number *= 100000000;
  } else if (cleaned.includes('만')) {
    number *= 10000;
  }
  
  return number;
};

const formatCurrency = (value: number): string => {
  if (value >= 1000000000000) {
    return `${(value / 1000000000000).toFixed(1)}조원`;
  } else if (value >= 100000000) {
    return `${(value / 100000000).toFixed(0)}억원`;
  } else if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}만원`;
  }
  return `${value.toLocaleString()}원`;
};

interface AssetComparisonTableProps {
  initialAssets?: Asset[] | any[];
  hideDeepDive?: boolean;
  onClose?: () => void;
  initialFilter?: {
    filter?: string | null;
    range?: string | null;
    volatilityThreshold?: string | null;
  };
  showRsiColumn?: boolean;
}

export function AssetComparisonTable({ initialAssets = defaultAssets, hideDeepDive = false, onClose, initialFilter, showRsiColumn = false }: AssetComparisonTableProps) {
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({ key: 'rank', direction: 'ascending' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedFilterMenu, setSelectedFilterMenu] = useState<string>('mcap');
  const [tempFilterValues, setTempFilterValues] = useState<Record<string, string | string[] | number[]>>({});
  const [changeFilterPeriod, setChangeFilterPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [changeFilterMin, setChangeFilterMin] = useState<string>('');
  const [changeFilterMax, setChangeFilterMax] = useState<string>('');
  const [rsiSelected, setRsiSelected] = useState<'oversold' | 'overbought' | null>(null);
  const [selectedFilterForDetail, setSelectedFilterForDetail] = useState<Filter | null>(null);

  // URL 파라미터로부터 필터 자동 적용
  useEffect(() => {
    if (!initialFilter?.filter) return;

    const filterType = initialFilter.filter;
    
    if (filterType === 'rsi') {
      const range = initialFilter.range;
      let rsiFilter: Filter;
      
      if (range === 'overbought') {
        rsiFilter = {
          id: 'rsi-auto',
          type: 'rsi',
          label: 'RSI',
          value: 'RSI 70 이상 (과매수)',
          rawValue: { type: 'rsi', overbought: true, oversold: false, timeframe: '1d' },
        };
        setRsiSelected('overbought');
      } else if (range === 'oversold') {
        rsiFilter = {
          id: 'rsi-auto',
          type: 'rsi',
          label: 'RSI',
          value: 'RSI 30 이하 (과매도)',
          rawValue: { type: 'rsi', overbought: false, oversold: true, timeframe: '1d' },
        };
        setRsiSelected('oversold');
      } else {
        // 기본값: 과매도
        rsiFilter = {
          id: 'rsi-auto',
          type: 'rsi',
          label: 'RSI',
          value: 'RSI 30 이하 (과매도)',
          rawValue: { type: 'rsi', overbought: false, oversold: true, timeframe: '1d' },
        };
        setRsiSelected('oversold');
      }
      setActiveFilters([rsiFilter]);
      setSelectedFilterMenu('rsi');
    }
  }, [initialFilter]);

  const convertedAssets = useMemo(() => {
    return initialAssets.map((asset: any) => {
      if ('rank' in asset && 'today' in asset && 'week' in asset && 'month' in asset) {
        return { ...asset, rsi: asset.rsi || Math.floor(Math.random() * 100) } as Asset;
      }
      const ticker = asset.ticker || asset.id;
      const matchingAsset = assetsData.find(a => a.ticker === ticker);
      if (matchingAsset) {
        return {
          ...matchingAsset,
          ...asset,
          rsi: asset.rsi || matchingAsset.rsi || Math.floor(Math.random() * 100),
          deepDive: asset.deepDive || deepDiveData[ticker as keyof typeof deepDiveData] || deepDiveData.BTC
        } as Asset;
      }
      return {
        rank: 0,
        name: asset.name || '',
        ticker: ticker || '',
        today: asset.change?.['1D'] || 0,
        week: asset.change?.['1W'] || 0,
        month: asset.change?.['1M'] || 0,
        marketCap: '-',
        circulatingSupply: '-',
        supplyRatio: 0,
        img: asset.img || '',
        marketCapDominance: '-',
        athPrice: '-',
        athDate: '-',
        rsi: asset.rsi || Math.floor(Math.random() * 100),
        ...asset,
        deepDive: asset.deepDive || deepDiveData[ticker as keyof typeof deepDiveData] || deepDiveData.BTC
      } as Asset;
    });
  }, [initialAssets]);

  const filteredAssets = useMemo(() => {
    let assets = [...convertedAssets];
    
    if (searchQuery) {
      assets = assets.filter(asset => 
        asset.ticker.includes(searchQuery.toUpperCase()) || 
        asset.name.includes(searchQuery)
      );
    }

    if (activeFilters.length === 0) {
      return assets;
    }

    return assets.filter(asset => {
      return activeFilters.every(filter => {
        if (filter.type === 'mcap' && filter.rawValue && Array.isArray(filter.rawValue)) {
          if (filter.rawValue.length > 0 && Array.isArray(filter.rawValue[0])) {
            const ranges = filter.rawValue as number[][];
            return ranges.some(([min, max]) => {
              if (max <= 10000) {
                return asset.rank >= min && asset.rank <= max;
              }
              const assetMcap = parseMarketCap(asset.marketCap || '0');
              return assetMcap >= min && assetMcap <= max;
            });
          } else if (filter.rawValue.length === 2) {
            const [min, max] = filter.rawValue as number[];
            if (max <= 10000) {
              return asset.rank >= min && asset.rank <= max;
            }
            const assetMcap = parseMarketCap(asset.marketCap || '0');
            return assetMcap >= min && assetMcap <= max;
          }
        }
        if (filter.type === 'change' && filter.rawValue && typeof filter.rawValue === 'object' && !Array.isArray(filter.rawValue)) {
          const changeFilter = filter.rawValue as { period?: string; min?: number; max?: number };
          if (changeFilter.period && changeFilter.min !== undefined) {
            let assetValue: number;
            if (changeFilter.period === 'today') {
              assetValue = asset.today;
            } else if (changeFilter.period === 'week') {
              assetValue = asset.week;
            } else {
              assetValue = asset.month;
            }
            const max = changeFilter.max !== null && changeFilter.max !== undefined ? changeFilter.max : Infinity;
            return assetValue >= changeFilter.min && assetValue <= max;
          }
        }
        if (filter.type === 'rsi' && filter.rawValue && typeof filter.rawValue === 'object' && !Array.isArray(filter.rawValue)) {
          const rsiFilter = filter.rawValue as { overbought?: boolean; oversold?: boolean };
          const assetRsi = asset.rsi || 50;
          if (rsiFilter.oversold) {
            return assetRsi <= 30;
          } else if (rsiFilter.overbought) {
            return assetRsi >= 70;
          }
        }
        return true;
      });
    });
  }, [activeFilters, convertedAssets, searchQuery]);

  const sortedAssets = useMemo(() => {
    let sortableItems = [...filteredAssets];
    sortableItems.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch(sortConfig.key) {
        case 'holderCount':
          aValue = a.deepDive.holderCount;
          bValue = b.deepDive.holderCount;
          break;
        case 'netDeposit24h':
          aValue = parseCurrency(a.deepDive.netDeposit24h);
          bValue = parseCurrency(b.deepDive.netDeposit24h);
          break;
        case 'tradingVolume':
          aValue = parseCurrency(a.deepDive.tradingVolume);
          bValue = parseCurrency(b.deepDive.tradingVolume);
          break;
        case 'marketCap':
          aValue = parseMarketCap(a.marketCap);
          bValue = parseMarketCap(b.marketCap);
          break;
        case 'rsi':
          aValue = a.rsi || 50;
          bValue = b.rsi || 50;
          break;
        default:
          aValue = a[sortConfig.key as keyof Asset];
          bValue = b[sortConfig.key as keyof Asset];
      }

      if (typeof aValue === 'string') {
        aValue = parseFloat(aValue.replace(/[^0-9.-]+/g,""));
      }
      if (typeof bValue === 'string') {
        bValue = parseFloat(bValue.replace(/[^0-9.-]+/g,""));
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [sortConfig, filteredAssets]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return <ChevronDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'ascending' ? <ChevronDown className="h-4 w-4 transform rotate-180" /> : <ChevronDown className="h-4 w-4" />;
  };

  const handleApplyFilter = () => {
    const currentFilter = filterOptions[selectedFilterMenu];
    if (!currentFilter) return;

    let displayValue = '';
    let rawValue: string | string[] | number[] | Record<string, any> | undefined;

    if (currentFilter.type === 'range' && selectedFilterMenu === 'mcap') {
      const value = tempFilterValues[selectedFilterMenu];
      if (!value || !Array.isArray(value) || value.length !== 2) return;
      const [min, max] = value as number[];
      displayValue = `${formatCurrency(min)} ~ ${formatCurrency(max)}`;
      rawValue = value;
    } else if (currentFilter.type === 'custom' && selectedFilterMenu === 'change') {
      if (!changeFilterMin) return;
      const periodLabel = changeFilterPeriod === 'today' ? '24시간' : changeFilterPeriod === 'week' ? '1주일' : '1개월';
      const min = parseFloat(changeFilterMin);
      const max = changeFilterMax ? parseFloat(changeFilterMax) : null;
      
      let valueLabel = '';
      if (max !== null && !isNaN(max)) {
        const minLabel = min >= 0 ? `+${min.toFixed(1)}` : min.toFixed(1);
        const maxLabel = max >= 0 ? `+${max.toFixed(1)}` : max.toFixed(1);
        valueLabel = `${minLabel}% ~ ${maxLabel}%`;
      } else {
        const minLabel = min >= 0 ? `+${min.toFixed(1)}` : min.toFixed(1);
        valueLabel = `${minLabel}% 이상`;
      }
      
      displayValue = `${periodLabel} ${valueLabel}`;
      rawValue = { 
        period: changeFilterPeriod,
        min: min,
        max: max,
      };
    } else if (currentFilter.type === 'checkbox') {
      const value = tempFilterValues[selectedFilterMenu];
      if (!value || !Array.isArray(value) || value.length === 0) return;
      displayValue = value.map(v => {
        const option = currentFilter.options?.find(opt => opt.value === v);
        return option?.label || v;
      }).join(', ');
      rawValue = value;
    }

    if (!displayValue) return;

    const existingFilterIndex = activeFilters.findIndex(f => f.type === selectedFilterMenu as Filter['type']);
    
    const filterData: Filter = {
      id: `${selectedFilterMenu}-${Date.now()}`,
      type: selectedFilterMenu as Filter['type'],
      label: currentFilter.name,
      value: displayValue,
      rawValue: rawValue as any,
    };
    
    if (existingFilterIndex >= 0) {
      const newFilters = [...activeFilters];
      newFilters[existingFilterIndex] = filterData;
      setActiveFilters(newFilters);
    } else {
      setActiveFilters([...activeFilters, filterData]);
    }

    setFilterDialogOpen(false);
  };

  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter(f => f.id !== filterId));
  };

  const handleResetFilters = () => {
    setActiveFilters([]);
    setTempFilterValues({});
    setChangeFilterPeriod('today');
    setChangeFilterMin('');
    setChangeFilterMax('');
  };

  const handleRangeChange = (values: number[]) => {
    setTempFilterValues({ ...tempFilterValues, [selectedFilterMenu]: values });
  };

  const formatCurrencyInput = (input: string): number => {
    const cleaned = input.replace(/[^0-9.조억만]/g, '');
    let number = parseFloat(cleaned.replace(/[조억만]/g, '')) || 0;
    
    if (cleaned.includes('조')) {
      number *= 1000000000000;
    } else if (cleaned.includes('억')) {
      number *= 100000000;
    } else if (cleaned.includes('만')) {
      number *= 10000;
    }
    
    return number;
  };

  const handleRangeInputChange = (index: 0 | 1, inputValue: string) => {
    const currentFilter = filterOptions[selectedFilterMenu];
    if (!currentFilter || currentFilter.type !== 'range') return;
    
    const numericValue = formatCurrencyInput(inputValue);
    const clampedValue = Math.max(
      currentFilter.min || 0,
      Math.min(currentFilter.max || 100000000000000, numericValue)
    );
    
    const currentRange = (tempFilterValues[selectedFilterMenu] as number[]) || [
      currentFilter.min || 0,
      currentFilter.max || 100000000000000,
    ];
    const newRange = [...currentRange];
    newRange[index] = clampedValue;
    
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    } else if (index === 1 && newRange[1] < newRange[0]) {
      newRange[0] = newRange[1];
    }
    
    setTempFilterValues({ ...tempFilterValues, [selectedFilterMenu]: newRange });
  };

  return (
    <div className="w-full space-y-6 bg-black text-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-black border-b border-zinc-800 z-50 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-white hover:bg-zinc-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold">코인 골라보기</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 text-sm border-zinc-700 text-white hover:bg-zinc-800"
              onClick={() => setFilterDialogOpen(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              필터 추가
            </Button>
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogContent className="max-w-3xl w-[90vw] max-h-[85vh] flex flex-col p-0 bg-black border-zinc-800 z-[201]">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
                  <DialogTitle className="text-white">필터 추가</DialogTitle>
                </DialogHeader>
                <div className="flex flex-1 overflow-hidden">
                  {/* Left Sidebar - Filter Menu */}
                  <div className="w-48 border-r border-zinc-800 bg-zinc-900/30 p-4 overflow-y-auto">
                    <nav className="space-y-4">
                      {filterGroups.map((group) => (
                        <div key={group.id} className="space-y-1">
                          <div className="px-3 py-2 text-xs font-semibold rounded-md mb-1 border-b border-zinc-800 text-muted-foreground">
                            {group.name}
                          </div>
                          {group.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setSelectedFilterMenu(item.id)}
                              className={cn(
                                'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                selectedFilterMenu === item.id
                                  ? 'bg-zinc-800 text-white'
                                  : 'text-muted-foreground hover:bg-zinc-800/50 hover:text-white'
                              )}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      ))}
                    </nav>
                  </div>

                  {/* Right Content - Filter Options */}
                  <div className="flex-1 p-8 overflow-y-auto">
                    {filterOptions[selectedFilterMenu] && (() => {
                      const currentFilter = filterOptions[selectedFilterMenu];
                      const currentValue = tempFilterValues[selectedFilterMenu];

                      if (currentFilter.type === 'range') {
                        const defaultRange: number[] = [
                          currentFilter.min || 0,
                          currentFilter.max || 100000000000000,
                        ];
                        if (!currentValue || !Array.isArray(currentValue)) {
                          setTempFilterValues({ ...tempFilterValues, [selectedFilterMenu]: defaultRange });
                        }
                      }

                      return (
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                              {currentFilter.name}
                            </h3>
                            {currentFilter.description && (
                              <p className="text-sm text-muted-foreground">
                                {currentFilter.description}
                              </p>
                            )}
                          </div>

                          <div className="space-y-4">
                            {currentFilter.type === 'range' && selectedFilterMenu === 'mcap' && (
                              <div className="space-y-6">
                                <div className="space-y-4">
                                  <Label className="text-sm font-medium text-white">시가총액 범위 선택</Label>
                                  <div className="grid grid-cols-2 gap-2.5">
                                    {[
                                      { label: '1000억 미만', min: 0, max: 100000000000 },
                                      { label: '1000억 ~ 5000억', min: 100000000000, max: 500000000000 },
                                      { label: '5000억 ~ 1조', min: 500000000000, max: 1000000000000 },
                                      { label: '1조 ~ 5조', min: 1000000000000, max: 5000000000000 },
                                      { label: '5조 ~ 10조', min: 5000000000000, max: 10000000000000 },
                                      { label: '10조 이상', min: 10000000000000, max: 100000000000000 },
                                    ].map((preset) => {
                                      const currentMcap = tempFilterValues.mcap;
                                      let isSelected = false;
                                      
                                      if (Array.isArray(currentMcap) && currentMcap.length === 2) {
                                        isSelected = currentMcap[0] === preset.min && currentMcap[1] === preset.max;
                                      }
                                      
                                      return (
                                        <button
                                          key={preset.label}
                                          onClick={() => {
                                            setTempFilterValues({
                                              ...tempFilterValues,
                                              mcap: [preset.min, preset.max],
                                            });
                                          }}
                                          className={cn(
                                            'p-3.5 rounded-xl border-2 transition-all duration-200 text-left relative',
                                            'hover:border-primary/50 hover:bg-primary/5',
                                            isSelected
                                              ? 'border-primary bg-primary/10 shadow-sm'
                                              : 'border-zinc-700 bg-zinc-900'
                                          )}
                                        >
                                          <span className="font-medium text-sm text-white block">{preset.label}</span>
                                          {isSelected && (
                                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                              <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                              </svg>
                                            </div>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}

                            {currentFilter.type === 'custom' && selectedFilterMenu === 'change' && (
                              <div className="space-y-6">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-end gap-4">
                                    <div className="inline-flex gap-1 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shrink-0">
                                      <button
                                        onClick={() => setChangeFilterPeriod('today')}
                                        className={cn(
                                          'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                                          changeFilterPeriod === 'today'
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-white hover:bg-zinc-800'
                                        )}
                                      >
                                        24시간
                                      </button>
                                      <button
                                        onClick={() => setChangeFilterPeriod('week')}
                                        className={cn(
                                          'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                                          changeFilterPeriod === 'week'
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-white hover:bg-zinc-800'
                                        )}
                                      >
                                        1주일
                                      </button>
                                      <button
                                        onClick={() => setChangeFilterPeriod('month')}
                                        className={cn(
                                          'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                                          changeFilterPeriod === 'month'
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-white hover:bg-zinc-800'
                                        )}
                                      >
                                        1개월
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-white">등락률 범위</Label>
                                      <div className="flex items-center gap-4">
                                        <div className="flex-1 space-y-2">
                                          <Label className="text-sm font-medium text-white">최소값</Label>
                                          <div className="flex items-center gap-2">
                                            <Input
                                              type="number"
                                              placeholder="예: -10"
                                              value={changeFilterMin}
                                              onChange={(e) => setChangeFilterMin(e.target.value)}
                                              step={0.1}
                                              className="h-11 text-base bg-zinc-900 border-zinc-700 text-white"
                                            />
                                            <span className="text-muted-foreground text-sm">%</span>
                                          </div>
                                        </div>
                                        <div className="pt-8 text-muted-foreground text-lg font-medium">~</div>
                                        <div className="flex-1 space-y-2">
                                          <Label className="text-sm font-medium text-white">최대값 (선택)</Label>
                                          <div className="flex items-center gap-2">
                                            <Input
                                              type="number"
                                              value={changeFilterMax}
                                              onChange={(e) => setChangeFilterMax(e.target.value)}
                                              step={0.1}
                                              className="h-11 text-base bg-zinc-900 border-zinc-700 text-white"
                                            />
                                            <span className="text-muted-foreground text-sm">%</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                      <Button
                                        size="sm"
                                        onClick={handleApplyFilter}
                                        className="flex-1 h-11"
                                        disabled={!changeFilterMin}
                                      >
                                        적용
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {currentFilter.type === 'custom' && selectedFilterMenu === 'rsi' && (
                              <div className="space-y-6">
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-white">RSI 범위 선택</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                      <button
                                        onClick={() => setRsiSelected('oversold')}
                                        className={cn(
                                          'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                                          rsiSelected === 'oversold'
                                            ? 'border-primary bg-primary/5 shadow-sm'
                                            : 'border-zinc-700 bg-zinc-900 hover:border-primary/50 hover:shadow-md'
                                        )}
                                      >
                                        <div className="font-medium text-sm text-white">과매도</div>
                                        <div className="text-xs text-muted-foreground mt-1">RSI 30 이하</div>
                                      </button>
                                      <button
                                        onClick={() => setRsiSelected('overbought')}
                                        className={cn(
                                          'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                                          rsiSelected === 'overbought'
                                            ? 'border-primary bg-primary/5 shadow-sm'
                                            : 'border-zinc-700 bg-zinc-900 hover:border-primary/50 hover:shadow-md'
                                        )}
                                      >
                                        <div className="font-medium text-sm text-white">과매수</div>
                                        <div className="text-xs text-muted-foreground mt-1">RSI 70 이상</div>
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 pt-2">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        if (rsiSelected === 'oversold') {
                                          const rsiFilter: Filter = {
                                            id: 'rsi-oversold',
                                            type: 'rsi',
                                            label: 'RSI',
                                            value: `RSI 30 이하 (과매도)`,
                                            rawValue: { type: 'rsi', overbought: false, oversold: true, timeframe: '1d' },
                                          };
                                          const otherFilters = activeFilters.filter(f => f.type !== 'rsi');
                                          setActiveFilters([...otherFilters, rsiFilter]);
                                          setRsiSelected(null);
                                          setFilterDialogOpen(false);
                                        } else if (rsiSelected === 'overbought') {
                                          const rsiFilter: Filter = {
                                            id: 'rsi-overbought',
                                            type: 'rsi',
                                            label: 'RSI',
                                            value: `RSI 70 이상 (과매수)`,
                                            rawValue: { type: 'rsi', overbought: true, oversold: false, timeframe: '1d' },
                                          };
                                          const otherFilters = activeFilters.filter(f => f.type !== 'rsi');
                                          setActiveFilters([...otherFilters, rsiFilter]);
                                          setRsiSelected(null);
                                          setFilterDialogOpen(false);
                                        }
                                      }}
                                      disabled={!rsiSelected}
                                      className="flex-1 h-11"
                                    >
                                      {rsiSelected === 'oversold' ? '과매도 적용하기' : rsiSelected === 'overbought' ? '과매수 적용하기' : '적용'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {currentFilter.type === 'checkbox' && currentFilter.options && (
                              <div className="grid grid-cols-2 gap-3">
                                {currentFilter.options.map((option) => {
                                  const checked = Array.isArray(currentValue) && (currentValue as string[]).includes(option.value);
                                  return (
                                    <button
                                      key={option.value}
                                      onClick={() => {
                                        const currentValues = (tempFilterValues[selectedFilterMenu] as string[]) || [];
                                        const newValues = currentValues.includes(option.value)
                                          ? currentValues.filter(v => v !== option.value)
                                          : [...currentValues, option.value];
                                        setTempFilterValues({ ...tempFilterValues, [selectedFilterMenu]: newValues });
                                      }}
                                      className={cn(
                                        'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                                        'hover:border-primary/50 hover:shadow-md',
                                        checked
                                          ? 'border-primary bg-primary/5 shadow-sm'
                                          : 'border-zinc-700 bg-zinc-900'
                                      )}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm text-white">{option.label}</span>
                                        {checked && (
                                          <div className="w-5 h-5 rounded border-2 border-primary bg-primary flex items-center justify-center">
                                            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-zinc-800 bg-black">
                  {activeFilters.length > 0 && (
                    <div className="px-6 pt-4 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {activeFilters.map((filter) => (
                          <div
                            key={filter.id}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-xs"
                          >
                            <span className="text-white font-medium">{filter.value || filter.label}</span>
                            <button
                              onClick={() => handleRemoveFilter(filter.id)}
                              className="hover:text-destructive transition-colors rounded-full hover:bg-destructive/10 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="px-6 pb-6 pt-3 flex items-center justify-between gap-3">
                    <button
                      onClick={handleResetFilters}
                      className="text-sm text-muted-foreground hover:text-white transition-colors underline-offset-4 hover:underline"
                    >
                      모든 필터 초기화
                    </button>
                    <Button
                      onClick={handleApplyFilter}
                      className="h-11 px-6 font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <span className="text-base">{filteredAssets.length}개</span>
                      <span className="text-sm ml-1 opacity-90">코인 보기</span>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-3 text-sm border-zinc-700 text-white hover:bg-zinc-800">
                  <Search className="w-3 h-3 mr-1" />
                  검색
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-black border-zinc-800" align="end">
                <div className="p-2">
                  <Input
                    placeholder="티커 검색 (예: BTC, ETH)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    className="mb-2 bg-zinc-900 border-zinc-700 text-white"
                  />
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-1">
                      {convertedAssets
                        .filter(asset => 
                          asset.ticker.includes(searchQuery) || 
                          asset.name.includes(searchQuery) ||
                          searchQuery === ''
                        )
                        .map((asset) => (
                          <button
                            key={asset.ticker}
                            onClick={() => {
                              setSelectedAsset(asset);
                              setSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center gap-2 p-2 rounded hover:bg-zinc-800 text-left"
                          >
                            {asset.img && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={asset.img} alt={asset.name} />
                                <AvatarFallback className="bg-zinc-800 text-white">{asset.ticker}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{asset.name}</div>
                              <div className="text-xs text-muted-foreground">{asset.ticker}</div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {activeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilterForDetail(filter)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-xs cursor-pointer hover:bg-zinc-700 transition-colors"
              >
                <span className="text-white font-medium">{filter.value || filter.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Filter Detail View */}
        {selectedFilterForDetail && (
          <div className="fixed inset-0 bg-black z-[300] overflow-y-auto">
            <div className="min-h-screen pb-20">
              {/* Header */}
              <div className="sticky top-0 bg-black border-b border-zinc-800 z-10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFilterForDetail(null)}
                    className="h-8 w-8 text-white hover:bg-zinc-800"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <h1 className="text-xl font-bold text-white">{selectedFilterForDetail.label || selectedFilterForDetail.value}</h1>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 py-6">
                {selectedFilterForDetail.type === 'rsi' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        RSI는 코인의 과매수 또는 과매도 상태를 나타내는 지표예요. RSI가 70 이상이면 과매수로 매도 타이밍을 고려해볼 수 있고, 30 이하면 과매도로 매수 기회로 볼 수 있어요.
                      </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold text-white">RSI 범위 선택</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              const filterRawValue = selectedFilterForDetail.rawValue as any;
                              const updatedFilter: Filter = {
                                ...selectedFilterForDetail,
                                id: 'rsi-oversold',
                                value: `RSI 30 이하 (과매도)`,
                                rawValue: { type: 'rsi', overbought: false, oversold: true, timeframe: '1d' },
                              };
                              setActiveFilters(activeFilters.map(f => 
                                f.id === selectedFilterForDetail.id ? updatedFilter : f
                              ));
                              setSelectedFilterForDetail(updatedFilter);
                            }}
                            className={cn(
                              'p-5 rounded-lg border-2 transition-all duration-200 text-left',
                              (selectedFilterForDetail.rawValue as any)?.oversold && !(selectedFilterForDetail.rawValue as any)?.overbought
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-zinc-700 bg-zinc-900 hover:border-primary/50 hover:shadow-md'
                            )}
                          >
                            <div className="font-semibold text-base text-white mb-1">과매도</div>
                            <div className="text-sm text-muted-foreground">RSI 30 이하</div>
                          </button>
                          <button
                            onClick={() => {
                              const updatedFilter: Filter = {
                                ...selectedFilterForDetail,
                                id: 'rsi-overbought',
                                value: `RSI 70 이상 (과매수)`,
                                rawValue: { type: 'rsi', overbought: true, oversold: false, timeframe: '1d' },
                              };
                              setActiveFilters(activeFilters.map(f => 
                                f.id === selectedFilterForDetail.id ? updatedFilter : f
                              ));
                              setSelectedFilterForDetail(updatedFilter);
                            }}
                            className={cn(
                              'p-5 rounded-lg border-2 transition-all duration-200 text-left',
                              (selectedFilterForDetail.rawValue as any)?.overbought && !(selectedFilterForDetail.rawValue as any)?.oversold
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-zinc-700 bg-zinc-900 hover:border-primary/50 hover:shadow-md'
                            )}
                          >
                            <div className="font-semibold text-base text-white mb-1">과매수</div>
                            <div className="text-sm text-muted-foreground">RSI 70 이상</div>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="pt-4">
                      <Button
                        onClick={() => {
                          setSelectedFilterForDetail(null);
                        }}
                        className="w-full h-12 text-base font-semibold"
                      >
                        {filteredAssets.length}개 보기
                      </Button>
                    </div>
                  </div>
                )}

                {selectedFilterForDetail.type === 'mcap' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        시가총액은 코인의 현재 가격에 유통량을 곱한 값이에요. 시가총액이 높을수록 시장에서 더 큰 비중을 차지하는 코인이라고 볼 수 있어요.
                      </p>
                    </div>

                    {/* Options - Similar to RSI but for market cap */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold text-white">시가총액 범위 선택</Label>
                        <div className="space-y-3">
                          <button className="w-full p-4 rounded-lg border-2 border-zinc-700 bg-zinc-900 hover:border-primary/50 hover:shadow-md text-left">
                            <div className="font-medium text-white">직접 설정하기</div>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="pt-4">
                      <Button
                        onClick={() => {
                          setSelectedFilterForDetail(null);
                        }}
                        className="w-full h-12 text-base font-semibold"
                      >
                        {filteredAssets.length}개 보기
                      </Button>
                    </div>
                  </div>
                )}

                {selectedFilterForDetail.type === 'change' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        가격 등락률은 특정 기간 동안의 가격 변동을 퍼센트로 나타낸 값이에요. 양수는 상승, 음수는 하락을 의미해요.
                      </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold text-white">등락률 범위 선택</Label>
                        <div className="space-y-3">
                          <button className="w-full p-4 rounded-lg border-2 border-zinc-700 bg-zinc-900 hover:border-primary/50 hover:shadow-md text-left">
                            <div className="font-medium text-white">직접 설정하기</div>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="pt-4">
                      <Button
                        onClick={() => {
                          setSelectedFilterForDetail(null);
                        }}
                        className="w-full h-12 text-base font-semibold"
                      >
                        {filteredAssets.length}개 보기
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="px-4 pb-4">
        <div className="relative">
          {/* Fixed Left Column + Scrollable Right Content */}
          <div className="flex">
            {/* Fixed Left Column - Asset Name */}
            <div className="sticky left-0 z-10 bg-black min-w-[140px] flex-shrink-0 border-r border-zinc-800">
              <div className="px-3 py-2.5 border-b border-zinc-800 h-[44px] flex items-center">
                <div className="text-muted-foreground font-semibold text-xs">
                  가상자산명
                </div>
              </div>
              {sortedAssets.map((asset) => (
                <div
                  key={asset.rank}
                  onClick={() => {
                    if (selectedAsset?.ticker === asset.ticker) {
                      setSelectedAsset(null);
                    } else {
                      setSelectedAsset(asset);
                    }
                  }}
                  className={cn(
                    'px-3 py-2.5 border-b border-zinc-800 cursor-pointer hover:bg-zinc-900/30 transition-colors h-[64px] flex items-center',
                    selectedAsset?.ticker === asset.ticker && 'bg-zinc-900/50'
                  )}
                >
                  <div className="flex items-center gap-2.5 w-full">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={asset.img} />
                      <AvatarFallback className="bg-zinc-800 text-white text-xs">{asset.ticker ? asset.ticker.charAt(0) : asset.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white text-xs whitespace-nowrap truncate leading-tight">{asset.name}</div>
                      <div className="text-muted-foreground text-[10px] mt-0.5 leading-tight">{asset.ticker}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scrollable Right Content */}
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-max">
                {/* Header */}
                <div className="flex border-b border-zinc-800 h-[44px]">
                  <div className="px-3 py-2.5 text-right text-muted-foreground font-semibold text-xs whitespace-nowrap min-w-[80px] flex items-center justify-end" onClick={() => requestSort('today')}>
                    <div className="flex items-center justify-end gap-1 cursor-pointer">
                      오늘 {getSortIcon('today')}
                    </div>
                  </div>
                  <div className="px-3 py-2.5 text-right text-muted-foreground font-semibold text-xs whitespace-nowrap min-w-[80px] flex items-center justify-end" onClick={() => requestSort('week')}>
                    <div className="flex items-center justify-end gap-1 cursor-pointer">
                      1주일 {getSortIcon('week')}
                    </div>
                  </div>
                  <div className="px-3 py-2.5 text-right text-muted-foreground font-semibold text-xs whitespace-nowrap min-w-[80px] flex items-center justify-end" onClick={() => requestSort('month')}>
                    <div className="flex items-center justify-end gap-1 cursor-pointer">
                      1개월 {getSortIcon('month')}
                    </div>
                  </div>
                  <div className="px-3 py-2.5 text-right text-muted-foreground font-semibold text-xs whitespace-nowrap min-w-[100px] flex items-center justify-end" onClick={() => requestSort('tradingVolume')}>
                    <div className="flex items-center justify-end gap-1 cursor-pointer">
                      거래량 (24H) {getSortIcon('tradingVolume')}
                    </div>
                  </div>
                  <div className="px-3 py-2.5 text-right text-muted-foreground font-semibold text-xs whitespace-nowrap min-w-[120px] flex items-center justify-end" onClick={() => requestSort('netDeposit24h')}>
                    <div className="flex items-center justify-end gap-1 cursor-pointer">
                      거래소입금 (24H) {getSortIcon('netDeposit24h')}
                    </div>
                  </div>
                  <div className="px-3 py-2.5 text-right text-muted-foreground font-semibold text-xs whitespace-nowrap min-w-[150px] flex items-center justify-end" onClick={() => requestSort('marketCap')}>
                    <div className="flex items-center justify-end gap-1 cursor-pointer">
                      시가총액 / 유통량 {getSortIcon('marketCap')}
                    </div>
                  </div>
                  {(showRsiColumn || activeFilters.some(f => f.type === 'rsi')) && (
                    <div className="px-3 py-2.5 text-right text-muted-foreground font-semibold text-xs whitespace-nowrap min-w-[60px] flex items-center justify-end" onClick={() => requestSort('rsi')}>
                      <div className="flex items-center justify-end gap-1 cursor-pointer">
                        RSI {getSortIcon('rsi')}
                      </div>
                    </div>
                  )}
                  <div className="px-3 py-2.5 text-right min-w-[80px] flex items-center justify-end"></div>
                </div>

                {/* Body */}
                {sortedAssets.map((asset) => (
                  <div
                    key={asset.rank}
                    onClick={() => {
                      if (selectedAsset?.ticker === asset.ticker) {
                        setSelectedAsset(null);
                      } else {
                        setSelectedAsset(asset);
                      }
                    }}
                    className={cn(
                      'flex border-b border-zinc-800 cursor-pointer hover:bg-zinc-900/30 transition-colors h-[64px]',
                      selectedAsset?.ticker === asset.ticker && 'bg-zinc-900/50'
                    )}
                  >
                    <div className={cn(
                      'px-3 py-2.5 text-right font-mono text-xs min-w-[80px] flex items-center justify-end',
                      asset.today > 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {formatPercentage(asset.today)}
                    </div>
                    <div className={cn(
                      'px-3 py-2.5 text-right font-mono text-xs min-w-[80px] flex items-center justify-end',
                      asset.week > 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {formatPercentage(asset.week)}
                    </div>
                    <div className={cn(
                      'px-3 py-2.5 text-right font-mono text-xs min-w-[80px] flex items-center justify-end',
                      asset.month > 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {formatPercentage(asset.month)}
                    </div>
                    <div className="px-3 py-2.5 text-right font-mono text-white text-xs min-w-[100px] flex items-center justify-end">
                      {asset.deepDive.tradingVolume}
                    </div>
                    <div className="px-3 py-2.5 text-right min-w-[120px] flex items-center justify-end">
                      <div className={cn(
                        "font-mono text-xs",
                        asset.deepDive.netDeposit24h.startsWith('-') ? 'text-blue-500' : 'text-red-500'
                      )}>
                        {asset.deepDive.netDeposit24h}
                      </div>
                    </div>
                    <div className="px-3 py-2.5 text-right min-w-[150px] flex items-center justify-end">
                      <div className="flex flex-col items-end">
                        <div className='text-white text-xs'>{asset.marketCap}</div>
                        <div className="text-muted-foreground text-[10px]">
                          {asset.circulatingSupply}
                        </div>
                        <Progress value={asset.supplyRatio} className="h-0.5 mt-1 bg-zinc-800 w-full" />
                      </div>
                    </div>
                    {(showRsiColumn || activeFilters.some(f => f.type === 'rsi')) && (
                      <div className="px-3 py-2.5 text-right min-w-[60px] flex items-center justify-end">
                        <div className={cn(
                          "font-mono font-semibold text-xs",
                          (asset.rsi || 50) <= 30 ? 'text-blue-500' : (asset.rsi || 50) >= 70 ? 'text-red-500' : 'text-white'
                        )}>
                          {asset.rsi || 50}
                        </div>
                      </div>
                    )}
                    <div className="px-3 py-2.5 text-right min-w-[80px] flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-md border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground text-xs h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        거래하기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {!hideDeepDive && selectedAsset && (
        <>
          <div className="h-px w-full bg-zinc-800"></div>
          <div className="px-4 py-4">
            <div className="text-white">
              <h3 className="text-lg font-bold mb-2">{selectedAsset.name} 상세 정보</h3>
              <p className="text-sm text-muted-foreground">상세 정보는 추후 추가 예정입니다.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
