import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle, 
  BarChart3, 
  Code2, 
  Layers, 
  Database, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpRight, 
  Target, 
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import { AssetAnalysisResult, QuantitativeAuditModel } from '../types';
import { buildQuantitativeAudit } from '../utils/quantitativeAuditEngine';

interface QuantitativeAuditSectionProps {
  analysis: AssetAnalysisResult;
}

export const QuantitativeAuditSection: React.FC<QuantitativeAuditSectionProps> = ({ analysis }) => {
  const [isFormulasOpen, setIsFormulasOpen] = useState(false);
  const [selectedFactorIndex, setSelectedFactorIndex] = useState<number | null>(null);

  // Compute or use quantitative audit
  const audit: QuantitativeAuditModel = analysis.quantitativeAudit || buildQuantitativeAudit(analysis);

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'A+':
        return 'bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-500/20';
      case 'A':
        return 'bg-emerald-600 text-white border-emerald-500';
      case 'B+':
        return 'bg-amber-500 text-white border-amber-400';
      default:
        return 'bg-slate-700 text-white border-slate-600';
    }
  };

  const getSignalBadge = (sig: 'BULLISH' | 'NEUTRAL' | 'BEARISH') => {
    switch (sig) {
      case 'BULLISH':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'BEARISH':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Institutional Header Banner */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Motor de Fiabilidad & Auditoría Cuantitativa
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                Grado Institucional
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ¿Por qué es confiable este veredicto para {analysis.asset}?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              Cada nivel de compra, stop loss y objetivo se somete a un modelo matemático transparente con verificación multivariable, doble fuente de cotizaciones y backtesting histórico de 52 semanas.
            </p>
          </div>

          {/* Reliability Score Card */}
          <div className="flex items-center gap-3 bg-slate-800/80 p-3 sm:p-4 rounded-xl border border-slate-700 shrink-0">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl border shadow-sm ${getRatingBadge(audit.reliabilityRating)}`}>
              {audit.reliabilityRating}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold">Calificación de Fiabilidad</div>
              <div className="text-lg font-black text-white flex items-center gap-1.5">
                <span>{audit.globalConfluenceScore}%</span>
                <span className="text-xs font-bold text-emerald-400">Confluencia Cuantitativa</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Auditado contra 5 pilares matemáticos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Trust Highlights / Data Quality Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/70 border-b border-slate-200">
        <div className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Database className="w-3.5 h-3.5 text-emerald-600" /> Fuente Primaria
          </div>
          <div className="text-xs font-black text-slate-900 truncate" title={audit.dataQualityAudit.primaryFeed}>
            {audit.dataQualityAudit.primaryFeed}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Consistencia: {audit.dataQualityAudit.quoteConsistency}
          </div>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Award className="w-3.5 h-3.5 text-blue-600" /> Tasa de Acierto (Win Rate)
          </div>
          <div className="text-base font-black text-emerald-700">
            {audit.backtest.winRatePct}% Histórico
          </div>
          <div className="text-[10px] text-slate-500">
            En {audit.backtest.totalTradesTracked} operaciones semanales
          </div>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Factor de Beneficio
          </div>
          <div className="text-base font-black text-slate-900">
            {audit.backtest.profitFactor}x Profit Factor
          </div>
          <div className="text-[10px] text-slate-500">
            Max Drawdown: <strong className="text-rose-600 font-bold">{audit.backtest.maxDrawdownPct}%</strong>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-600" /> Ratio R:R Promedio
          </div>
          <div className="text-base font-black text-emerald-700">
            {audit.backtest.averageRiskReward}
          </div>
          <div className="text-[10px] text-slate-500">
            Asimetría favorable obligatoria
          </div>
        </div>
      </div>

      {/* Main Breakdown: 5 Quantitative Factors */}
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Desglose de los 5 Pilares de Verificación Matemática
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Ponderación total: 100%
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Cada factor aporta un porcentaje al cálculo final de confianza. Haz clic en cualquiera de ellos para ver su fórmula matemática y lectura en vivo:
          </p>

          <div className="space-y-3">
            {audit.factors.map((factor, idx) => {
              const isSelected = selectedFactorIndex === idx;
              return (
                <div 
                  key={factor.name}
                  onClick={() => setSelectedFactorIndex(isSelected ? null : idx)}
                  className={`border rounded-xl p-4 transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-50/80 border-emerald-400 ring-2 ring-emerald-500/10 shadow-xs' 
                      : 'bg-white hover:bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-xs text-slate-700 shrink-0">
                        {factor.weight}%
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <span>{factor.name}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getSignalBadge(factor.signal)}`}>
                            {factor.signal === 'BULLISH' ? 'ALCISTA' : factor.signal === 'BEARISH' ? 'BAJISTA' : 'NEUTRAL'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {factor.liveReading}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900">
                          Puntaje: <span className="text-emerald-700">{factor.score}/100</span>
                        </div>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full rounded-full ${
                              factor.score >= 70 ? 'bg-emerald-500' : factor.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${factor.score}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-slate-400 text-xs">
                        {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail with Mathematical Formula */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 animate-in fade-in duration-150">
                      <div className="text-xs text-slate-700 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-900">Justificación Cuantitativa: </strong>
                        {factor.rationale}
                      </div>
                      <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-2.5 rounded-lg flex items-center gap-2 overflow-x-auto">
                        <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300 font-bold">Fórmula:</span>
                        <span>{factor.formula}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mathematical Formulas Transparency Accordion */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsFormulasOpen(!isFormulasOpen)}
            className="w-full p-4 bg-slate-50 hover:bg-slate-100/70 text-left flex items-center justify-between text-xs font-extrabold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>Transparencia Algorítmica: Fórmulas de Cálculo de Entrada, Stop Loss y Take Profit</span>
            </div>
            <span className="text-slate-500">
              {isFormulasOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {isFormulasOpen && (
            <div className="p-4 bg-white border-t border-slate-200 space-y-3 font-mono text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-sans font-bold text-[11px] block mb-1">Rango Óptimo de Entrada:</span>
                <span className="text-slate-900 font-bold">{audit.formulaBreakdown.entryFormula}</span>
              </div>
              <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-200">
                <span className="text-rose-600 font-sans font-bold text-[11px] block mb-1">Stop Loss (Invalidación Técnica):</span>
                <span className="text-rose-900 font-bold">{audit.formulaBreakdown.stopLossFormula}</span>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
                <span className="text-emerald-600 font-sans font-bold text-[11px] block mb-1">Take Profit (Objetivo a 7 Días):</span>
                <span className="text-emerald-900 font-bold">{audit.formulaBreakdown.takeProfitFormula}</span>
              </div>
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-200">
                <span className="text-blue-600 font-sans font-bold text-[11px] block mb-1">Filtro de Relación Riesgo / Beneficio:</span>
                <span className="text-blue-900 font-bold">{audit.formulaBreakdown.riskRewardFormula}</span>
              </div>
            </div>
          )}
        </div>

        {/* Backtest Track Record Box */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Metodología de Validación Backtesting de 52 Semanas</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-2xl">
              {audit.backtest.methodology} Muestreo: {audit.backtest.samplePeriod}.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-black shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> Modelo Auditado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
