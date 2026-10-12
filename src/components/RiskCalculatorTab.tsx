import React, { useState, useEffect } from 'react';
import { Calculator, ShieldAlert, CheckCircle2, DollarSign, Percent, ArrowRight, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { AssetAnalysisResult, Timeframe } from '../types';
import { getActiveTimeframeData, TIMEFRAME_CONFIGS } from '../utils/timeframeEngine';

interface RiskCalculatorTabProps {
  currentAnalysis?: AssetAnalysisResult | null;
  timeframe?: Timeframe;
  onTimeframeChange?: (tf: Timeframe) => void;
}

export const RiskCalculatorTab: React.FC<RiskCalculatorTabProps> = ({ 
  currentAnalysis,
  timeframe = '1W',
  onTimeframeChange
}) => {
  const [activeTf, setActiveTf] = useState<Timeframe>(timeframe);
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [stopLossPrice, setStopLossPrice] = useState<number>(95);
  const [targetPrice, setTargetPrice] = useState<number>(112);
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    setActiveTf(timeframe);
  }, [timeframe]);

  // Load from current active analysis & timeframe
  const loadFromAnalysis = (tf: Timeframe = activeTf) => {
    if (!currentAnalysis) return;
    const tfData = getActiveTimeframeData(currentAnalysis, tf);
    const entry = Number(tfData.optimalEntryRange?.min || currentAnalysis.currentEstimatedPrice || 100);
    const sl = Number(tfData.stopLossSuggested?.price || entry * 0.95);
    const tp = Number(tfData.targetPrice?.price || entry * 1.08);
    setEntryPrice(entry);
    setStopLossPrice(sl);
    setTargetPrice(tp);
    if (currentAnalysis.currency) setCurrency(currentAnalysis.currency);
  };

  useEffect(() => {
    if (currentAnalysis) {
      loadFromAnalysis(activeTf);
    }
  }, [currentAnalysis, activeTf]);

  const handleTfChange = (tf: Timeframe) => {
    setActiveTf(tf);
    if (onTimeframeChange) onTimeframeChange(tf);
    loadFromAnalysis(tf);
  };

  // Calculations
  const riskAmount = (accountBalance * riskPercent) / 100;
  const isLong = targetPrice > entryPrice;
  const perShareRisk = isLong ? Math.max(entryPrice - stopLossPrice, 0.0001) : Math.max(stopLossPrice - entryPrice, 0.0001);
  const perShareProfit = isLong ? Math.max(targetPrice - entryPrice, 0) : Math.max(entryPrice - targetPrice, 0);

  const positionSize = perShareRisk > 0 ? riskAmount / perShareRisk : 0;
  const totalPositionCost = positionSize * entryPrice;
  const totalPotentialProfit = positionSize * perShareProfit;
  const riskRewardRatio = perShareRisk > 0 ? (perShareProfit / perShareRisk).toFixed(2) : '0';
  const slPercent = entryPrice > 0 ? ((perShareRisk / entryPrice) * 100).toFixed(2) : '0';
  const tpPercent = entryPrice > 0 ? ((perShareProfit / entryPrice) * 100).toFixed(2) : '0';

  const tfConfig = TIMEFRAME_CONFIGS[activeTf] || TIMEFRAME_CONFIGS['1W'];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-600" />
              Calculadora de Gestión de Riesgo y Tamaño de Posición
            </h2>
            <p className="text-slate-600 text-sm mt-0.5">
              Calcula exactamente cuántas unidades comprar para proteger tu capital en operaciones de <strong className="text-emerald-800">{tfConfig.label} ({tfConfig.sublabel})</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe Selector inside Calculator */}
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 flex-wrap gap-0.5">
              {(['H1', 'H2', 'H4', '1D', '1W', '1M'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  id={`calc-timeframe-${tf}-btn`}
                  type="button"
                  onClick={() => handleTfChange(tf)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    activeTf === tf
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {currentAnalysis && (
              <button
                id="load-active-asset-btn"
                onClick={() => loadFromAnalysis(activeTf)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Cargar {currentAnalysis.asset} ({tfConfig.label})
              </button>
            )}
          </div>
        </div>

        {/* Wall Street Benchmarks Quick Loader */}
        <div className="flex flex-wrap items-center gap-2 pt-4 pb-2 border-b border-slate-100 text-xs">
          <span className="font-bold text-slate-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Activos de Wall Street:
          </span>
          {[
            { label: 'NVDA ($135.50)', price: 135.50, sl: 129.80, tp: 147.00, cur: 'USD' },
            { label: 'AAPL ($228.40)', price: 228.40, sl: 221.00, tp: 242.00, cur: 'USD' },
            { label: 'TSLA ($218.40)', price: 218.40, sl: 206.50, tp: 238.00, cur: 'USD' },
            { label: 'S&P 500 ($596.25)', price: 596.25, sl: 585.00, tp: 615.00, cur: 'USD' },
            { label: 'Nasdaq ($216.80)', price: 216.80, sl: 211.00, tp: 226.50, cur: 'USD' },
            { label: 'Bitcoin ($96,850)', price: 96850, sl: 93500, tp: 104000, cur: 'USD' },
          ].map((preset, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => {
                setEntryPrice(preset.price);
                setStopLossPrice(preset.sl);
                setTargetPrice(preset.tp);
                setCurrency(preset.cur);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-lg font-bold text-slate-700 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Inputs & Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
              Parámetros de tu Cuenta & Entrada ({tfConfig.label})
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Capital Total de la Cuenta ({currency}):
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(Math.max(Number(e.target.value), 1))}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Riesgo Máximo por Operación (%):
                </label>
                <span className="text-xs font-extrabold text-emerald-700">
                  {riskPercent}% = ${(accountBalance * riskPercent / 100).toFixed(2)} {currency}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.25"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                <span>0.5% (Conservador)</span>
                <span>1.5% (Recomendado {tfConfig.label})</span>
                <span>5% (Agresivo)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Precio de Entrada Previsto ({currency}):
                </label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Math.max(Number(e.target.value), 0.0001))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rose-700 mb-1">
                    Stop Loss ({currency}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(Math.max(Number(e.target.value), 0.0001))}
                    className="w-full px-3 py-2 bg-rose-50/50 border border-rose-300 rounded-xl text-rose-900 font-bold text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                    Distancia: -{slPercent}%
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-700 mb-1">
                    Take Profit ({currency}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Math.max(Number(e.target.value), 0.0001))}
                    className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-emerald-900 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    Distancia: +{tpPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-inner">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  Orden de Ejecución ({tfConfig.label})
                </span>
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Ratio R:R = 1:{riskRewardRatio}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Calculated Units to Buy */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 font-semibold block mb-1">
                    Tamaño de Posición a Comprar:
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {positionSize >= 1 ? positionSize.toFixed(2) : positionSize.toFixed(4)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Acciones / Contratos / Monedas
                  </span>
                </div>

                {/* Total Capital Allocated */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 font-semibold block mb-1">
                    Valor Total de la Posición:
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    ${totalPositionCost.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    ({((totalPositionCost / accountBalance) * 100).toFixed(1)}% del capital total)
                  </span>
                </div>

                {/* Max Loss */}
                <div className="bg-rose-950/40 p-4 rounded-xl border border-rose-800/60">
                  <span className="text-xs text-rose-300 font-semibold block mb-1">
                    Pérdida Máxima si Toca Stop Loss:
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-rose-400">
                    -${riskAmount.toFixed(2)} {currency}
                  </div>
                  <span className="text-[11px] text-rose-300/80">
                    Exactamente el {riskPercent}% de tu cuenta
                  </span>
                </div>

                {/* Potential Profit */}
                <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/60">
                  <span className="text-xs text-emerald-300 font-semibold block mb-1">
                    Beneficio Estimado en Target ({tfConfig.label}):
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-300">
                    +${totalPotentialProfit.toFixed(2)} {currency}
                  </div>
                  <span className="text-[11px] text-emerald-300/80">
                    +{((totalPotentialProfit / accountBalance) * 100).toFixed(2)}% de ganancia global
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Golden Rules */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 text-xs text-slate-300 space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Regla de Oro para Operativa ({tfConfig.label}):
              </div>
              <p className="text-slate-400 leading-relaxed">
                Nunca arriesgues más del 2% por operación individual. Si el ratio R:R es menor a 1:1.5 en el horizonte de {tfConfig.label}, espera un retroceso hacia el soporte óptimo antes de ejecutar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
