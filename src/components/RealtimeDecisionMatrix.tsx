import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Clock, 
  RefreshCw, 
  Target, 
  AlertTriangle, 
  DollarSign, 
  Sliders, 
  CheckCircle2, 
  Radio, 
  Crosshair,
  ArrowRight
} from 'lucide-react';
import { 
  AssetAnalysisResult, 
  Timeframe, 
  LiveMarketQuote 
} from '../types';
import { 
  computeRealtimeDecision, 
  calculateTacticalPositionSize 
} from '../utils/realtimeDecisionEngine';
import { getActiveTimeframeData } from '../utils/timeframeEngine';

interface RealtimeDecisionMatrixProps {
  analysis: AssetAnalysisResult;
  timeframe: Timeframe;
  liveQuote?: LiveMarketQuote | null;
  isSyncing: boolean;
  tickDirection: 'UP' | 'DOWN' | 'SAME' | null;
  lastSyncTime: Date;
  isAutoSyncActive: boolean;
  activeInterval: number;
  onToggleAutoSync: () => void;
  onRefreshNow: () => void;
  onChangeInterval: (sec: number) => void;
  onOpenFullCalculator: () => void;
}

export const RealtimeDecisionMatrix: React.FC<RealtimeDecisionMatrixProps> = ({
  analysis,
  timeframe,
  liveQuote,
  isSyncing,
  tickDirection,
  lastSyncTime,
  isAutoSyncActive,
  activeInterval,
  onToggleAutoSync,
  onRefreshNow,
  onChangeInterval,
  onOpenFullCalculator,
}) => {
  const [userCapital, setUserCapital] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(1.5);
  const [isQuickCalcOpen, setIsQuickCalcOpen] = useState<boolean>(false);

  // Derive active timeframe data
  const tfData = getActiveTimeframeData(analysis, timeframe);

  // Determine current active live price
  const effectivePrice = liveQuote?.price || Number(analysis.currentEstimatedPrice) || 100;
  const currency = analysis.currency || 'USD';

  // Compute live real-time decision dynamically adapted to active timeframe
  const decision = computeRealtimeDecision(
    effectivePrice,
    tfData,
    tfData.verdict || analysis.verdict,
    currency
  );

  // Position sizing with real-time price
  const positionMetrics = calculateTacticalPositionSize(
    userCapital,
    riskPct,
    effectivePrice,
    decision.stopLossPrice,
    decision.targetPrice
  );

  const getUrgencyBadge = () => {
    switch (decision.urgency) {
      case 'INMEDIATA':
        return 'bg-emerald-500 text-slate-950 font-black animate-pulse';
      case 'ESPERAR_RETROCESO':
        return 'bg-amber-400 text-slate-950 font-bold';
      case 'ALERTA_RIESGO':
        return 'bg-rose-600 text-white font-bold animate-bounce';
      default:
        return 'bg-blue-500 text-white font-bold';
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden transition-all">
      {/* Real-time Ticker & Control Bar */}
      <div className="bg-slate-950 text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isAutoSyncActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isAutoSyncActive ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            </span>
            <span className="text-xs font-black tracking-wide text-emerald-400 uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> MOTOR DE DECISIÓN EN TIEMPO REAL
            </span>
          </div>

          <span className="hidden sm:inline text-slate-500">|</span>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
            <span>Última sincronización:</span>
            <span className="font-mono text-slate-200">
              {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ET
            </span>
          </div>
        </div>

        {/* Polling & Refresh Controls */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            <button
              id="interval-10s-btn"
              onClick={() => onChangeInterval(10)}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                activeInterval === 10 && isAutoSyncActive
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Actualizar cada 10 segundos"
            >
              10s
            </button>
            <button
              id="interval-30s-btn"
              onClick={() => onChangeInterval(30)}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                activeInterval === 30 && isAutoSyncActive
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Actualizar cada 30 segundos"
            >
              30s
            </button>
            <button
              id="interval-pause-btn"
              onClick={onToggleAutoSync}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                !isAutoSyncActive
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isAutoSyncActive ? 'Pausar auto-sincronización' : 'Reanudar auto-sincronización'}
            >
              {isAutoSyncActive ? 'Pausar' : 'Reanudar'}
            </button>
          </div>

          <button
            id="refresh-live-quote-btn"
            onClick={onRefreshNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* Main Execution Signal Banner */}
      <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider font-black ${getUrgencyBadge()}`}>
                {decision.urgency === 'INMEDIATA' ? 'ACCIONABLE AHORA' : decision.urgency}
              </span>
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Horizonte Activo: {tfData.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                {decision.badgeLabel}
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed max-w-4xl">
              {decision.actionDirective}
            </p>
          </div>

          {/* Current Live Tick Price Display with Flash Highlight */}
          <div className="flex flex-col items-start lg:items-end bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0 min-w-[240px]">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-500 animate-ping" /> Cotización en Vivo ({analysis.ticker})
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight transition-all duration-300 ${
                tickDirection === 'UP' 
                  ? 'text-emerald-600 scale-105' 
                  : tickDirection === 'DOWN' 
                  ? 'text-rose-600 scale-105' 
                  : 'text-slate-950'
              }`}>
                ${effectivePrice.toFixed(2)}
              </span>
              <span className="text-xs font-extrabold text-slate-500">{currency}</span>
            </div>

            {liveQuote && typeof liveQuote.changePercent === 'number' && (
              <div className="flex items-center gap-1.5 mt-1 text-xs font-extrabold">
                <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                  liveQuote.change >= 0 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {liveQuote.change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {liveQuote.change >= 0 ? '+' : ''}{liveQuote.changePercent.toFixed(2)}%
                </span>
                <span className="text-slate-400 font-medium">({liveQuote.priceSource})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Dynamic Metric Gauges in Real Time */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white">
        {/* Metric 1: Distance to Target */}
        <div className="p-4 sm:p-5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-emerald-600" /> Distancia al Objetivo
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {decision.distanceToTargetPct > 0 ? `+${decision.distanceToTargetPct}%` : '0% (Alcanzado)'}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Meta: ${decision.targetPrice.toFixed(2)} {currency}
          </p>
        </div>

        {/* Metric 2: Distance to Stop Loss */}
        <div className="p-4 sm:p-5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Distancia al Stop Loss
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-700">
            {decision.distanceToStopLossPct > 0 ? `-${decision.distanceToStopLossPct}%` : 'Perforado'}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Invalidación: ${decision.stopLossPrice.toFixed(2)} {currency}
          </p>
        </div>

        {/* Metric 3: Live Risk/Reward Asymmetry */}
        <div className="p-4 sm:p-5 bg-slate-50/50">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-blue-600" /> Asimetría R/B en Vivo
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {decision.liveRiskRewardRatio}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Calculado con precio actual
          </p>
        </div>

        {/* Metric 4: Optimal Pocket State */}
        <div className="p-4 sm:p-5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Crosshair className="w-3.5 h-3.5 text-amber-600" /> Zona Táctica
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            ${decision.entryMin.toFixed(2)} - ${decision.entryMax.toFixed(2)}
          </div>
          <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded mt-1 ${
            decision.isInOptimalZone 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            {decision.isInOptimalZone ? '✓ Precio Dentro de Rango' : '○ Fuera de Rango'}
          </span>
        </div>
      </div>

      {/* Quick Tactical Order Sizing Drawer */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            id="toggle-quick-order-calc-btn"
            type="button"
            onClick={() => setIsQuickCalcOpen(!isQuickCalcOpen)}
            className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-800 hover:text-emerald-600 transition-colors"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>
              {isQuickCalcOpen ? 'Ocultar Disparador de Órdenes Tácticas' : 'Dimensionar Orden en Tiempo Real con este Precio'}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {isQuickCalcOpen ? '▲ Cerrar' : '▼ Abrir Cálculo de Acciones'}
            </span>
          </button>

          <button
            id="go-to-full-calc-btn"
            type="button"
            onClick={onOpenFullCalculator}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
          >
            <span>Calculadora Avanzada</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isQuickCalcOpen && (
          <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
            {/* Input 1: Capital */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Capital de Cartera ({currency})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={userCapital}
                  onChange={(e) => setUserCapital(Math.max(100, Number(e.target.value) || 100))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-1.5 pt-1">
                {[2000, 5000, 10000, 25000].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setUserCapital(cap)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold"
                  >
                    ${cap / 1000}k
                  </button>
                ))}
              </div>
            </div>

            {/* Input 2: Risk % */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Riesgo Máximo por Operación (%):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={riskPct}
                  onChange={(e) => setRiskPct(Math.max(0.1, Math.min(10, Number(e.target.value) || 1)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
              <div className="flex gap-1.5 pt-1">
                {[0.5, 1.0, 1.5, 2.0].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRiskPct(r)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold"
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            {/* Live Recommendation Output */}
            <div className="bg-emerald-950 text-emerald-100 p-3.5 rounded-xl border border-emerald-800 space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                Orden Táctica Recomendada
              </span>
              <div className="text-lg font-black text-white">
                Comprar {positionMetrics.recommendedUnits} {analysis.ticker || 'unidades'}
              </div>
              <div className="text-xs text-emerald-200 space-y-0.5">
                <div>• Inversión: <strong>${positionMetrics.totalInvestmentDollars} {currency}</strong> ({positionMetrics.portfolioAllocationPct}% cartera)</div>
                <div>• Riesgo Máximo: <strong className="text-rose-300">-${positionMetrics.maxRiskDollars} {currency}</strong></div>
                <div>• Beneficio Esperado: <strong className="text-emerald-300">+${positionMetrics.potentialNetGainDollars} {currency}</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
