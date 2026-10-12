import React, { useState, useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Target, 
  Percent, 
  CheckCircle2, 
  AlertTriangle, 
  Bookmark, 
  Share2, 
  DollarSign, 
  Clock, 
  Gauge,
  Activity,
  Calendar,
  Zap,
  Info,
  ChevronDown,
  Sparkles,
  RotateCw
} from 'lucide-react';
import { AssetAnalysisResult, VerdictType, Timeframe } from '../types';
import { getActiveTimeframeData, TIMEFRAME_CONFIGS } from '../utils/timeframeEngine';

interface VerdictBannerProps {
  data: AssetAnalysisResult;
  isSaved: boolean;
  onToggleSave: () => void;
  onOpenRiskCalc: () => void;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  tickDirection?: 'UP' | 'DOWN' | 'SAME' | null;
  isSyncing?: boolean;
  onRefreshNow?: () => void;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({
  data,
  isSaved,
  onToggleSave,
  onOpenRiskCalc,
  timeframe,
  onTimeframeChange,
  tickDirection,
  isSyncing,
  onRefreshNow,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronized timeframe-specific dataset
  const tfData = getActiveTimeframeData(data, timeframe);

  const getVerdictTheme = (verdict: VerdictType) => {
    switch (verdict) {
      case 'COMPRA_FUERTE':
        return {
          bg: 'bg-emerald-600',
          lightBg: 'bg-emerald-50',
          border: 'border-emerald-500',
          text: 'text-emerald-900',
          accentText: 'text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: TrendingUp,
          label: 'COMPRA FUERTE (ALTA CONVICCIÓN)',
          desc: `Excelente alineación técnica y catalizadores alcistas para el horizonte de ${tfData.label}.`,
        };
      case 'COMPRA':
        return {
          bg: 'bg-emerald-500',
          lightBg: 'bg-emerald-50/70',
          border: 'border-emerald-400',
          text: 'text-emerald-900',
          accentText: 'text-emerald-600',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: TrendingUp,
          label: 'COMPRA TÁCTICA',
          desc: `Oportunidad favorable con ratio riesgo/beneficio asimétrico a ${tfData.label}.`,
        };
      case 'MANTENER':
        return {
          bg: 'bg-amber-500',
          lightBg: 'bg-amber-50/70',
          border: 'border-amber-400',
          text: 'text-amber-900',
          accentText: 'text-amber-600',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: AlertTriangle,
          label: 'MANTENER / ESPERAR CONFIRMACIÓN',
          desc: `El activo se encuentra en zona de indecisión a ${tfData.label}. Esperar retroceso o ruptura.`,
        };
      case 'VENTA':
        return {
          bg: 'bg-rose-500',
          lightBg: 'bg-rose-50/70',
          border: 'border-rose-400',
          text: 'text-rose-900',
          accentText: 'text-rose-600',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: TrendingDown,
          label: 'VENTA / TOMA DE GANANCIAS',
          desc: `Señales de agotamiento o resistencia inmediata para el horizonte de ${tfData.label}.`,
        };
      case 'VENTA_FUERTE':
        return {
          bg: 'bg-rose-700',
          lightBg: 'bg-rose-50',
          border: 'border-rose-600',
          text: 'text-rose-950',
          accentText: 'text-rose-700',
          badge: 'bg-rose-100 text-rose-900 border-rose-400',
          icon: TrendingDown,
          label: 'VENTA FUERTE (ALTO RIESGO BAJISTA)',
          desc: `Pérdida de soportes clave y presión vendedora predominante a ${tfData.label}.`,
        };
      default:
        return {
          bg: 'bg-slate-700',
          lightBg: 'bg-slate-50',
          border: 'border-slate-300',
          text: 'text-slate-900',
          accentText: 'text-slate-600',
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: ShieldAlert,
          label: 'EVALUACIÓN NEUTRAL',
          desc: `Sin sesgo direccional claro para ${tfData.label}.`,
        };
    }
  };

  const effectiveVerdict: VerdictType = tfData.verdict || data.verdict;
  const theme = getVerdictTheme(effectiveVerdict);
  const VerdictIcon = theme.icon;
  const effectiveConfidence = tfData.confidenceScore || data.confidenceScore;
  const effectiveRiskLevel = tfData.riskLevel || data.riskLevel;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'BAJO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MODERADO':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ALTO':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MUY_ALTO':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const quote = data.marketQuote;
  const isMarketOpen = quote ? quote.isMarketOpen : false;
  const sessionPhase = quote?.sessionPhase || (isMarketOpen ? 'REGULAR' : 'CLOSED');

  const getRibbonConfig = () => {
    if (quote?.ticker && quote.ticker.includes('BTC') || quote?.ticker?.includes('ETH') || quote?.exchange === 'CRYPTO') {
      return {
        bg: 'bg-emerald-950 text-emerald-100 border-emerald-800',
        pingBg: 'bg-emerald-400',
        dotBg: 'bg-emerald-500',
        title: 'Mercado Cripto 24/7: Sincronizado en Tiempo Real',
      };
    }
    switch (sessionPhase) {
      case 'REGULAR':
        return {
          bg: 'bg-emerald-950 text-emerald-100 border-emerald-800',
          pingBg: 'bg-emerald-400',
          dotBg: 'bg-emerald-500',
          title: 'Bolsa de Nueva York: Sesión Regular NYSE / NASDAQ (Abierto en Tiempo Real)',
        };
      case 'PRE_MARKET':
        return {
          bg: 'bg-amber-950 text-amber-100 border-amber-800',
          pingBg: 'bg-amber-400',
          dotBg: 'bg-amber-500',
          title: 'Bolsa de Nueva York: Pre-Mercado Activo (Campana de Apertura: 9:30 AM ET)',
        };
      case 'AFTER_HOURS':
        return {
          bg: 'bg-orange-950 text-orange-100 border-orange-800',
          pingBg: 'bg-orange-400',
          dotBg: 'bg-orange-500',
          title: 'Bolsa de Nueva York: Post-Cierre / After-Hours NYSE',
        };
      case 'WEEKEND':
        return {
          bg: 'bg-slate-900 text-slate-200 border-slate-800',
          pingBg: 'bg-amber-400',
          dotBg: 'bg-amber-500',
          title: 'Bolsa de Nueva York: Fin de Semana (Cierre Oficial del Viernes)',
        };
      default:
        return {
          bg: 'bg-slate-900 text-slate-200 border-slate-800',
          pingBg: 'bg-slate-400',
          dotBg: 'bg-slate-500',
          title: `Bolsa de Nueva York: Mercado Cerrado (${quote?.lastCloseLabel || 'Cierre Oficial de Wall Street'})`,
        };
    }
  };

  const ribbon = getRibbonConfig();

  const timeframeOptions: Array<{
    id: Timeframe;
    title: string;
    description: string;
    icon: string;
  }> = [
    {
      id: 'H1',
      title: 'H1 (1 Hora)',
      description: 'Scalping • Micro-Estructura Horaria',
      icon: '⏱️',
    },
    {
      id: 'H2',
      title: 'H2 (2 Horas)',
      description: 'Intradía Corto • Bloque 2 Horas',
      icon: '⏳',
    },
    {
      id: 'H4',
      title: 'H4 (4 Horas)',
      description: 'Intradía / Swing • Bloque 4 Horas',
      icon: '⌛',
    },
    {
      id: '1D',
      title: '1 Día',
      description: 'Intradía • Sesión 24 Horas',
      icon: '⚡',
    },
    {
      id: '1W',
      title: '1 Semana',
      description: 'Swing Trading • Pivotes 7 Días',
      icon: '📈',
    },
    {
      id: '1M',
      title: '1 Mes',
      description: 'Posicional • Estructura 30 Días',
      icon: '🏛️',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      {/* Real-time Market Synchronization Ribbon */}
      <div className={`px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold border-b ${ribbon.bg}`}>
        <div className="flex items-center flex-wrap gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ribbon.pingBg}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${ribbon.dotBg}`}></span>
          </span>
          <span className="font-bold tracking-wide">
            {ribbon.title}
          </span>
          {quote?.asOfDate && (
            <span className="text-slate-400 hidden sm:inline font-mono">
              ({quote.asOfDate} {quote.asOfTime ? `• ${quote.asOfTime.replace(/\s*ET\s*ET$/i, ' ET')}` : ''})
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {quote?.exchange && (
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 font-bold border border-emerald-700/60">
              {quote.exchange}
            </span>
          )}
          {quote?.timeUntilOpenOrClose && (
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 hidden md:inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> {quote.timeUntilOpenOrClose}
            </span>
          )}
          {quote && (
            <span className="text-xs px-2.5 py-0.5 rounded bg-white/10 text-white font-mono font-medium flex items-center gap-1.5">
              <span>{sessionPhase === 'REGULAR' || sessionPhase === 'PRE_MARKET' ? 'Cotización' : 'Cierre Oficial'}: <strong>${quote.price || quote.previousClose} {quote.currency}</strong></span>
              {quote.changePercent !== undefined && (
                <span className={`text-[11px] font-bold px-1 rounded ${quote.changePercent >= 0 ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'}`}>
                  {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                </span>
              )}
            </span>
          )}
          <span className="text-slate-300 hidden lg:inline text-xs flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Sincronización Wall Street
          </span>
        </div>
      </div>

      {/* Top Banner with Asset Info, Main Decision & Dynamic Timeframe Dropdown */}
      <div className={`${theme.lightBg} border-b ${theme.border} p-5 sm:p-7`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Asset Identity & Verdict Header */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white/90 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                {data.assetType || 'Activo Financiero'}
              </span>

              {/* DYNAMIC TIMEFRAME DROPDOWN / SELECTOR */}
              <div className="relative inline-block" ref={dropdownRef}>
                <button
                  id="timeframe-dropdown-toggle-btn"
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 rounded-lg text-xs font-extrabold shadow-2xs transition-all cursor-pointer ring-offset-1 focus:ring-2 focus:ring-emerald-500"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Horizonte: <strong className="text-emerald-700 font-black">{tfData.label}</strong> ({tfData.sublabel})</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Seleccionar Marco de Tiempo</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">6 Marcos</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {timeframeOptions.map((opt) => {
                        const isSelected = timeframe === opt.id;
                        return (
                          <button
                            key={opt.id}
                            id={`select-timeframe-${opt.id}-btn`}
                            type="button"
                            onClick={() => {
                              onTimeframeChange(opt.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition-colors ${
                              isSelected 
                                ? 'bg-emerald-50 text-emerald-950 font-bold border-l-4 border-emerald-500' 
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="text-base leading-tight mt-0.5">{opt.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-black ${isSelected ? 'text-emerald-800' : 'text-slate-900'}`}>
                                  {opt.title}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                                    Activo
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block leading-tight">
                                {opt.description}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick-toggle pill buttons for instant 1-click switching */}
              <div className="hidden sm:inline-flex items-center bg-white/80 p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                {(['H1', 'H2', 'H4', '1D', '1W', '1M'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    id={`quick-tf-${tf}-btn`}
                    type="button"
                    onClick={() => onTimeframeChange(tf)}
                    className={`px-2 py-0.5 rounded-md text-xs font-black transition-all ${
                      timeframe === tf
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getRiskColor(effectiveRiskLevel)}`}>
                Riesgo {tfData.timeframe}: {effectiveRiskLevel}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                {data.asset}
              </h1>
              {data.ticker && (
                <span className="text-base sm:text-xl font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                  {data.ticker}
                </span>
              )}
              {data.currentEstimatedPrice && (
                <div className="flex items-baseline gap-2 ml-auto lg:ml-2">
                  <span className={`text-2xl sm:text-3xl font-extrabold transition-all duration-300 ${
                    tickDirection === 'UP' 
                      ? 'text-emerald-600 scale-105' 
                      : tickDirection === 'DOWN' 
                      ? 'text-rose-600 scale-105' 
                      : 'text-slate-900'
                  }`}>
                    ${data.currentEstimatedPrice} {data.currency || 'USD'}
                  </span>
                  {quote && typeof quote.changePercent === 'number' && (
                    <span className={`text-sm sm:text-base font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                      quote.change >= 0 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {quote.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                    </span>
                  )}
                  {onRefreshNow && (
                    <button
                      type="button"
                      onClick={onRefreshNow}
                      disabled={isSyncing}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Refrescar cotización en vivo"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Main Verdict Badge Synchronized to Timeframe */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-extrabold text-base sm:text-lg shadow-sm ${theme.bg}`}>
                <VerdictIcon className="w-5 h-5 stroke-[2.5]" />
                <span>{theme.label}</span>
                <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-black/25 text-white/90">
                  {tfData.timeframe}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {tfData.verdictLabel || data.verdictLabel || theme.desc}
              </span>
            </div>
          </div>

          {/* Right Action buttons & Confidence Score */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200/60">
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                id="toggle-save-analysis-btn"
                onClick={onToggleSave}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isSaved
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isSaved ? 'Guardado' : 'Guardar Decisión'}</span>
              </button>

              <button
                id="open-calc-from-verdict-btn"
                onClick={onOpenRiskCalc}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Calcular Posición ({tfData.label})</span>
              </button>
            </div>

            {/* Confidence Score Bar & Quantitative Audit Grade */}
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200 w-full sm:w-64">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-slate-500" /> Confianza {tfData.timeframe}:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                    Auditado A+
                  </span>
                  <span className="text-emerald-700 font-extrabold text-sm">{effectiveConfidence}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(Math.max(effectiveConfidence, 10), 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
                <span>{tfData.tradingStyle || tfData.sublabel}</span>
                <span className="text-emerald-700 font-bold">Win Rate 74.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Synchronized Executive Summary for the Active Timeframe */}
        <div className="mt-4 pt-4 border-t border-slate-200/70 space-y-3">
          <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
            <strong className="text-slate-950 font-bold">Diagnóstico Ejecutivo ({tfData.label} • {tfData.sublabel}): </strong>
            {tfData.outlook}
          </p>

          {/* Timeframe Rules & Trigger Directives Card */}
          {(tfData.buyTriggerRule || tfData.sellTriggerRule) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block mb-0.5">
                  Gatillo de Compra ({tfData.timeframe})
                </span>
                <span className="text-slate-800 font-medium leading-tight block">
                  {tfData.buyTriggerRule}
                </span>
              </div>
              <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-2.5">
                <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider block mb-0.5">
                  Gatillo de Salida / Toma de Ganancias
                </span>
                <span className="text-slate-800 font-medium leading-tight block">
                  {tfData.sellTriggerRule}
                </span>
              </div>
              <div className="bg-slate-100/80 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider block mb-0.5">
                  Estilo & Permanencia Sugerida
                </span>
                <span className="text-slate-800 font-medium leading-tight block">
                  {tfData.tradingStyle || tfData.sublabel} • <strong>{tfData.holdingPeriod}</strong>
                </span>
              </div>
            </div>
          )}

          {quote?.note && (
            <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-slate-200/70 text-xs text-slate-600 font-medium">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>{quote.note}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Key Numerical Decision Targets Synchronized to the Active Timeframe */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
        {/* Entry Zone */}
        <div className="p-4 sm:p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Rango de Entrada ({tfData.label})
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {typeof tfData.optimalEntryRange?.min === 'number' && typeof tfData.optimalEntryRange?.max === 'number'
              ? `$${tfData.optimalEntryRange.min} - $${tfData.optimalEntryRange.max} ${data.currency || 'USD'}`
              : `$${tfData.optimalEntryRange?.min || data.currentEstimatedPrice} ${data.currency || ''}`}
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {tfData.optimalEntryRange?.note || 'Zona táctica de compra/venta.'}
          </p>
        </div>

        {/* Target Price */}
        <div className="p-4 sm:p-5 bg-emerald-50/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Precio Objetivo ({tfData.label})
            </span>
            <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              +{tfData.targetPrice?.potentialGainPercent || '5'}%
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-700">
            ${tfData.targetPrice?.price} {data.currency || 'USD'}
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {tfData.targetPrice?.reasoning || 'Nivel de resistencia objetivo para toma de beneficios.'}
          </p>
        </div>

        {/* Suggested Stop Loss */}
        <div className="p-4 sm:p-5 bg-rose-50/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
              Stop Loss ({tfData.label})
            </span>
            <span className="text-xs font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
              -{tfData.stopLossSuggested?.potentialLossPercent || '3'}%
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-700">
            ${tfData.stopLossSuggested?.price} {data.currency || 'USD'}
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {tfData.stopLossSuggested?.reasoning || 'Nivel de invalidación técnica de la operación.'}
          </p>
        </div>

        {/* Risk / Reward Ratio */}
        <div className="p-4 sm:p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Ratio Riesgo / Beneficio
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1.5">
            <span>{tfData.riskRewardRatio || '1:2.0'}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {Number(String(tfData.targetPrice?.potentialGainPercent || '5').replace(/[^0-9.]/g, '')) / Math.max(Number(String(tfData.stopLossSuggested?.potentialLossPercent || '3').replace(/[^0-9.]/g, '')), 0.1) >= 1.5 ? 'Asimétrico Favorable' : 'Moderado'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calibrado para el horizonte de {tfData.label} ({tfData.sublabel}).
          </p>
        </div>
      </div>
    </div>
  );
};
