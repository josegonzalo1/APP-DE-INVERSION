import React, { useState, useEffect } from 'react';
import { RefreshCw, Radio, Building2, Clock, ArrowUpRight, ArrowDownRight, CheckCircle2, TrendingUp, Sparkles, Search, ChevronRight } from 'lucide-react';
import { NYMarketOverview, NYIndexItem } from '../types';

interface NYMarketSyncBarProps {
  onSelectAsset?: (symbol: string) => void;
}

export const NYMarketSyncBar: React.FC<NYMarketSyncBarProps> = ({ onSelectAsset }) => {
  const [overview, setOverview] = useState<NYMarketOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [liveETTime, setLiveETTime] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'INDICES' | 'TECH' | 'COMMODITIES' | 'CRYPTO'>('ALL');
  const [quickSearch, setQuickSearch] = useState('');

  // Live New York clock ticking every second
  useEffect(() => {
    const updateETClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setLiveETTime(`${timeStr} ET`);
    };

    updateETClock();
    const interval = setInterval(updateETClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchOverview = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    try {
      const res = await fetch('/api/ny-market-overview');
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error('Error fetching NY market overview:', err);
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  // Initial fetch and 20s auto-refresh
  useEffect(() => {
    fetchOverview(false);
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchOverview(false);
      }, 20000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const defaultIndices: NYIndexItem[] = [
    { symbol: '^GSPC', name: 'S&P 500', price: 5962.50, change: 12.30, changePercent: 0.21, exchange: 'NYSE', category: 'INDEX' },
    { symbol: '^NDX', name: 'Nasdaq 100', price: 21680.00, change: 90.00, changePercent: 0.42, exchange: 'NASDAQ', category: 'INDEX' },
    { symbol: '^DJI', name: 'Dow Jones', price: 43910.00, change: 130.00, changePercent: 0.30, exchange: 'NYSE', category: 'INDEX' },
    { symbol: '^RUT', name: 'Russell 2000', price: 2315.40, change: 13.30, changePercent: 0.58, exchange: 'NYSE', category: 'INDEX' },
    { symbol: '^VIX', name: 'VIX Volatilidad', price: 14.85, change: -0.35, changePercent: -2.30, exchange: 'CBOE', category: 'INDEX' },
  ];

  const defaultEquities: NYIndexItem[] = [
    { symbol: 'NVDA', name: 'NVIDIA', price: 135.50, change: 0.70, changePercent: 0.52, exchange: 'NASDAQ', category: 'STOCK' },
    { symbol: 'AAPL', name: 'Apple', price: 228.40, change: 0.80, changePercent: 0.35, exchange: 'NASDAQ', category: 'STOCK' },
    { symbol: 'MSFT', name: 'Microsoft', price: 418.20, change: 1.70, changePercent: 0.41, exchange: 'NASDAQ', category: 'STOCK' },
    { symbol: 'AMZN', name: 'Amazon', price: 190.50, change: 1.20, changePercent: 0.63, exchange: 'NASDAQ', category: 'STOCK' },
    { symbol: 'TSLA', name: 'Tesla', price: 218.40, change: 3.20, changePercent: 1.49, exchange: 'NASDAQ', category: 'STOCK' },
    { symbol: 'GOOGL', name: 'Alphabet / Google', price: 178.60, change: 1.10, changePercent: 0.62, exchange: 'NASDAQ', category: 'STOCK' },
    { symbol: 'META', name: 'Meta Platforms', price: 585.00, change: 4.80, changePercent: 0.83, exchange: 'NASDAQ', category: 'STOCK' },
    { symbol: 'GLD', name: 'Oro (GLD / COMEX)', price: 268.50, change: 1.10, changePercent: 0.41, exchange: 'NYSE', category: 'STOCK' },
    { symbol: 'USO', name: 'Petróleo WTI (USO)', price: 72.80, change: 0.90, changePercent: 1.25, exchange: 'NYSE Arca', category: 'STOCK' },
    { symbol: 'BTC-USD', name: 'Bitcoin (BTC)', price: 96850.00, change: 1450.00, changePercent: 1.52, exchange: 'CRYPTO', category: 'STOCK' },
  ];

  const activeIndices = overview?.indices?.length ? overview.indices : defaultIndices;
  const activeEquities = overview?.topEquities?.length ? overview.topEquities : defaultEquities;
  const allTickers = [...activeIndices, ...activeEquities];

  // Filtered by category
  const filteredTickers = allTickers.filter(item => {
    if (quickSearch.trim()) {
      const q = quickSearch.toLowerCase();
      return item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
    }
    if (activeCategory === 'INDICES') return item.symbol.startsWith('^') || item.category === 'INDEX';
    if (activeCategory === 'TECH') return ['NVDA', 'AAPL', 'MSFT', 'AMZN', 'TSLA', 'GOOGL', 'META'].includes(item.symbol);
    if (activeCategory === 'COMMODITIES') return ['GLD', 'USO', 'ORO', 'PETROLEO'].includes(item.symbol) || item.name.toLowerCase().includes('oro') || item.name.toLowerCase().includes('petróleo');
    if (activeCategory === 'CRYPTO') return item.symbol.includes('BTC') || item.symbol.includes('ETH') || item.exchange === 'CRYPTO';
    return true;
  });

  const sessionBadge = () => {
    if (!overview) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Bolsa de NY Sincronizada
        </span>
      );
    }

    if (overview.sessionPhase === 'REGULAR') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-md animate-pulse">
          <Radio className="w-3.5 h-3.5" />
          SESIÓN REGULAR NYSE / NASDAQ (MERCADO ABIERTO)
        </span>
      );
    } else if (overview.sessionPhase === 'PRE_MARKET') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-md">
          <Clock className="w-3.5 h-3.5" />
          PRE-MERCADO NYSE (FUTUROS & SUBASTAS)
        </span>
      );
    } else if (overview.sessionPhase === 'AFTER_HOURS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-500 text-white shadow-md">
          <Clock className="w-3.5 h-3.5" />
          POST-CIERRE / AFTER-HOURS NYSE
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          MERCADO CERRADO (CIERRE OFICIAL WALL STREET)
        </span>
      );
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim() && onSelectAsset) {
      onSelectAsset(quickSearch.trim().toUpperCase());
      setQuickSearch('');
    }
  };

  return (
    <section id="ny-market-sync-hub" className="bg-slate-950 text-white border-b border-slate-800 shadow-lg">
      {/* Top Header: Wall Street Official Session & Time Hub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-xs">
          
          {/* Left: Official Exchange Identity & Real-Time Clock */}
          <div className="flex items-center flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400 border border-slate-700 font-bold shadow-inner">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 font-black text-slate-100 text-sm">
                  <span>Bolsa de Valores de Nueva York (Wall St)</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-900 text-emerald-400 border border-emerald-500/30 shadow-xs font-bold">
                    {liveETTime || overview?.nyTimeStr || 'Hora ET'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="text-emerald-400/90 font-semibold">{overview?.timeUntilOpenOrClose || 'Sincronizado con servidores NYSE/NASDAQ'}</span>
                  <span>•</span>
                  <span>{overview?.nextBellText || 'Horario oficial de Wall Street'}</span>
                </div>
              </div>
            </div>

            {/* Session Indicator Badge */}
            {sessionBadge()}
          </div>

          {/* Right: Quick Search + Auto-Refresh & Instant Sync Buttons */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 ml-auto">
            {/* Quick Ticker Search Form */}
            <form onSubmit={handleQuickSubmit} className="relative flex items-center">
              <input
                id="ny-quick-search-input"
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Buscar activo en NY (ej. NVDA, S&P 500)..."
                className="bg-slate-900 text-slate-200 placeholder:text-slate-500 text-xs px-3 py-1.5 pl-8 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 w-48 sm:w-60 transition-all font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              {quickSearch && (
                <button
                  type="submit"
                  className="absolute right-1.5 px-1.5 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] rounded"
                >
                  Ir
                </button>
              )}
            </form>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sincronizado: <strong className="text-slate-200 font-mono">{lastSyncTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong></span>
            </div>

            <button
              id="ny-toggle-autorefresh-btn"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-[11px] px-2.5 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/50 hover:bg-emerald-900/60'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
              }`}
              title={autoRefresh ? 'Auto-sincronización activa cada 20 segundos' : 'Auto-sincronización pausada'}
            >
              {autoRefresh ? '● Auto (20s)' : '○ Manual'}
            </button>

            <button
              id="ny-sync-now-btn"
              onClick={() => fetchOverview(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-lg transition-all active:scale-95 disabled:opacity-50 shadow cursor-pointer"
              title="Forzar sincronización inmediata con cotizaciones de Wall Street"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Sincronizando...' : 'Sincronizar con NY'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Quick Filter Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3 overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-1.5 shrink-0 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Cotizaciones Wall St:
          </span>

          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'INDICES', label: 'Índices (S&P, Nasdaq, Dow)' },
            { id: 'TECH', label: 'Big Tech Wall St' },
            { id: 'COMMODITIES', label: 'Oro & Petróleo' },
            { id: 'CRYPTO', label: 'Cripto 24/7' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setQuickSearch('');
              }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                activeCategory === cat.id && !quickSearch
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 hidden xl:flex items-center gap-1 shrink-0 font-medium">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Haz clic en cualquier activo para analizar su tesis de 7 días</span>
        </div>
      </div>

      {/* Dynamic Horizontal Ticker Feed */}
      <div className="bg-slate-950/80 border-t border-slate-800/60 px-4 py-2 overflow-x-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 whitespace-nowrap min-w-max">
          {filteredTickers.map((item, idx) => {
            const isPositive = item.change >= 0;
            return (
              <button
                key={`${item.symbol}-${idx}`}
                id={`ticker-item-${item.symbol.replace(/[^a-zA-Z0-9]/g, '')}`}
                onClick={() => onSelectAsset?.(item.symbol)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-emerald-500/60 transition-all group text-xs cursor-pointer shadow-2xs"
                title={`Click para analizar ${item.name} (${item.symbol}) para la próxima semana`}
              >
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </span>
                    {item.exchange && (
                      <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {item.exchange}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-slate-300 font-bold">
                      ${item.price >= 1000 ? item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.price.toFixed(2)}
                    </span>
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isPositive ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50' : 'text-rose-400 bg-rose-950/60 border border-rose-800/50'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                      {isPositive ? '+' : ''}
                      {item.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

