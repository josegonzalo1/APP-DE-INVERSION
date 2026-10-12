import React, { useState } from 'react';
import { 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  ArrowRight,
  Clock,
  Target,
  ShieldAlert,
  Zap,
  SlidersHorizontal,
  Table,
  Check
} from 'lucide-react';
import { AssetAnalysisResult, Timeframe, VerdictType } from '../types';
import { computeMultiTimeframeConfluence } from '../utils/realtimeDecisionEngine';

interface MultiTimeframeConfluenceSectionProps {
  analysis: AssetAnalysisResult;
  activeTimeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  currentLivePrice?: number;
}

export const MultiTimeframeConfluenceSection: React.FC<MultiTimeframeConfluenceSectionProps> = ({
  analysis,
  activeTimeframe,
  onSelectTimeframe,
  currentLivePrice,
}) => {
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('TABLE');
  const price = currentLivePrice || Number(analysis.currentEstimatedPrice) || (analysis.marketQuote?.price || 100);
  const confluence = computeMultiTimeframeConfluence(analysis, price);

  const getVerdictBadgeClass = (verdict: VerdictType) => {
    switch (verdict) {
      case 'COMPRA_FUERTE':
        return 'bg-emerald-600 text-white font-black';
      case 'COMPRA':
        return 'bg-emerald-500 text-slate-950 font-black';
      case 'MANTENER':
        return 'bg-amber-400 text-slate-950 font-black';
      case 'VENTA':
        return 'bg-rose-500 text-white font-bold';
      case 'VENTA_FUERTE':
        return 'bg-rose-700 text-white font-black';
      default:
        return 'bg-slate-700 text-white font-bold';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Header with Confluence Score & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Toma de Decisiones de Compra y Venta por Temporalidad (H1 a 1M)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Adaptación táctica según el horizonte de inversión: cada marco temporal posee sus propios disparadores de entrada, take profit y stop loss.
          </p>
        </div>

        {/* Global Confluence Score Gauge & View Toggle */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matriz Comparativa
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                viewMode === 'CARDS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tarjetas
            </button>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Confluencia
              </span>
              <span className="text-sm font-black text-slate-950">
                {confluence.score}% Alcista
              </span>
            </div>
            <div className={`px-2 py-0.5 rounded-lg text-xs font-black ${confluence.badgeBg}`}>
              {confluence.bullishCount}/6
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Synthesis Alert */}
      <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm">
        <Sparkles className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-indigo-950 font-bold block">
            {confluence.verdictTitle}
          </strong>
          <span className="text-indigo-900 leading-relaxed font-medium block">
            {confluence.verdictSummary}
          </span>
          <span className="text-[11px] text-indigo-700 font-semibold block pt-0.5">
            Marco actualmente seleccionado en la plataforma: <strong className="text-indigo-950 font-extrabold uppercase">{activeTimeframe}</strong>. Haz clic en cualquier temporalidad para cambiar la vista completa de la app.
          </span>
        </div>
      </div>

      {/* Quick Timeframe Switcher Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {confluence.items.map((item) => {
          const isActive = activeTimeframe === item.timeframe;
          const isBullish = item.bias === 'ALCISTA';
          const isBearish = item.bias === 'BAJISTA';

          return (
            <button
              key={item.timeframe}
              id={`confluence-tf-${item.timeframe}-btn`}
              type="button"
              onClick={() => onSelectTimeframe(item.timeframe)}
              className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-400'
                  : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-xs font-black px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {item.timeframe}
                  </span>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-slate-800 text-emerald-300' : getVerdictBadgeClass(item.verdict)
                  }`}>
                    {item.verdict}
                  </span>
                </div>

                <div className={`text-xs font-bold leading-tight ${isActive ? 'text-slate-200' : 'text-slate-800'}`}>
                  {item.label}
                </div>
                <div className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.holdingPeriod}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/40 flex items-center justify-between text-[11px]">
                <span className={isActive ? 'text-slate-300' : 'text-slate-600'}>
                  Target:
                </span>
                <span className={`font-black ${isActive ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  {item.targetPriceText.split(' ')[1] || item.targetPriceText}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* VIEW MODE 1: DETAILED DECISION MATRIX TABLE */}
      {viewMode === 'TABLE' && (
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white divide-x divide-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3 w-32">Temporalidad</th>
                <th className="p-3 w-32">Decisión</th>
                <th className="p-3 w-40">Rango de Entrada</th>
                <th className="p-3 w-36">Precio Objetivo</th>
                <th className="p-3 w-36">Stop Loss</th>
                <th className="p-3 w-28">Ratio R/B</th>
                <th className="p-3 min-w-[200px]">Gatillo de Compra</th>
                <th className="p-3 min-w-[200px]">Gatillo de Salida / Venta</th>
                <th className="p-3 w-24 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {confluence.items.map((item) => {
                const isActive = activeTimeframe === item.timeframe;

                return (
                  <tr 
                    key={item.timeframe}
                    className={`transition-colors ${
                      isActive 
                        ? 'bg-emerald-50/80 font-semibold' 
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Timeframe & Style */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-black ${
                          isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {item.timeframe}
                        </span>
                        <div>
                          <strong className="text-slate-900 block text-xs">{item.label}</strong>
                          <span className="text-[10px] text-slate-500 block">{item.holdingPeriod}</span>
                        </div>
                      </div>
                    </td>

                    {/* Verdict */}
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-black inline-block shadow-2xs ${getVerdictBadgeClass(item.verdict)}`}>
                        {item.verdict}
                      </span>
                    </td>

                    {/* Entry Range */}
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {item.entryRangeText}
                    </td>

                    {/* Target Price */}
                    <td className="p-3">
                      <span className="font-mono font-bold text-emerald-700 block">
                        {item.targetPriceText}
                      </span>
                    </td>

                    {/* Stop Loss */}
                    <td className="p-3">
                      <span className="font-mono font-bold text-rose-700 block">
                        {item.stopLossText}
                      </span>
                    </td>

                    {/* R/B Ratio */}
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {item.riskRewardRatio}
                    </td>

                    {/* Buy Trigger */}
                    <td className="p-3 text-[11px] text-slate-700 leading-tight">
                      <div className="flex items-start gap-1">
                        <span className="text-emerald-600 font-bold shrink-0">▲</span>
                        <span>{item.buyTriggerRule}</span>
                      </div>
                    </td>

                    {/* Sell Trigger */}
                    <td className="p-3 text-[11px] text-slate-700 leading-tight">
                      <div className="flex items-start gap-1">
                        <span className="text-rose-600 font-bold shrink-0">▼</span>
                        <span>{item.sellTriggerRule}</span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectTimeframe(item.timeframe)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          isActive 
                            ? 'bg-slate-900 text-white shadow-xs' 
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {isActive ? 'Activo ✓' : 'Elegir'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODE 2: CARDS EXPANDED */}
      {viewMode === 'CARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {confluence.items.map((item) => {
            const isActive = activeTimeframe === item.timeframe;

            return (
              <div
                key={item.timeframe}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50/30 shadow-md ring-2 ring-emerald-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-black text-xs">
                      {item.timeframe}
                    </span>
                    <strong className="text-slate-900 text-sm font-bold">{item.label}</strong>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-black ${getVerdictBadgeClass(item.verdict)}`}>
                    {item.verdict}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 mb-3">
                  {item.tradingStyle} • <strong>{item.holdingPeriod}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Entrada</span>
                    <span className="font-mono font-bold text-slate-800">{item.entryRangeText}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Ratio R/B</span>
                    <span className="font-mono font-bold text-slate-800">{item.riskRewardRatio}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 block font-bold uppercase">Target</span>
                    <span className="font-mono font-bold text-emerald-700">{item.targetPriceText}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 block font-bold uppercase">Stop Loss</span>
                    <span className="font-mono font-bold text-rose-700">{item.stopLossText}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] mb-3">
                  <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                    <strong className="text-emerald-900 block text-[10px] uppercase">Gatillo de Compra:</strong>
                    <span className="text-slate-700 leading-tight">{item.buyTriggerRule}</span>
                  </div>
                  <div className="bg-rose-50 p-2 rounded border border-rose-100">
                    <strong className="text-rose-900 block text-[10px] uppercase">Gatillo de Venta:</strong>
                    <span className="text-slate-700 leading-tight">{item.sellTriggerRule}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTimeframe(item.timeframe)}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {isActive ? 'Marco Activo en la App' : `Activar Decisión ${item.timeframe}`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Educational Footer on Multi-Timeframe Strategy */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
        <h4 className="font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          ¿Cómo se adapta la toma de decisiones entre H1 y 1 Mes?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] leading-relaxed pt-1">
          <div className="space-y-1">
            <strong className="text-slate-900 block font-bold">1. Scalping (H1 y H2):</strong>
            <span>Busca micro-impulsos en 15 a 60 minutos con ratios ajustados (+0.5% a +1.5%). Si el precio testea una resistencia horaria, la decisión cambia a <strong>VENTA</strong> o <strong>MANTENER</strong> para no comprar en máximos.</span>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-900 block font-bold">2. Intradía y Day Trading (H4 y 1D):</strong>
            <span>Opera el balance de la sesión de Wall Street. Utiliza VWAP y niveles pivote diarios con permanencia de 4 a 24 horas y salidas previas a la campana de cierre.</span>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-900 block font-bold">3. Swing y Posicional (1W y 1M):</strong>
            <span>Sigue la tendencia mayor respaldada por la EMA 50 y EMA 200 diaria. Tolera fluctuaciones intradiarias y ejecuta compras escalonadas (DCA) buscando expansiones de ciclo (+6% a +20%).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
