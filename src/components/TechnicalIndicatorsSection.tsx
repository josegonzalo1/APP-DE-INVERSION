import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Compass, 
  Gauge, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Sparkles, 
  Maximize2, 
  Minimize2 
} from 'lucide-react';
import { TechnicalIndicators, LiveMarketQuote, Timeframe, AssetAnalysisResult } from '../types';
import { getActiveTimeframeData, TIMEFRAME_CONFIGS } from '../utils/timeframeEngine';

interface TechnicalIndicatorsSectionProps {
  indicators: TechnicalIndicators;
  currency?: string;
  currentPrice?: string | number;
  marketQuote?: LiveMarketQuote | null;
  assetName?: string;
  timeframe?: Timeframe;
  fullAnalysis?: AssetAnalysisResult | null;
}

export const TechnicalIndicatorsSection: React.FC<TechnicalIndicatorsSectionProps> = ({ 
  indicators,
  currency = 'USD',
  currentPrice,
  marketQuote,
  assetName,
  timeframe = '1W',
  fullAnalysis
}) => {
  if (!indicators) return null;

  // Numeric parsing
  const rawPriceStr = String(currentPrice || marketQuote?.price || indicators.movingAverages?.ema20 || '0').replace(/[^0-9.]/g, '');
  const numCurrentPrice = parseFloat(rawPriceStr) || 0;

  const parseNum = (val: string | number | undefined): number => {
    if (!val) return 0;
    const clean = String(val).replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  };

  // Get timeframe configuration & synchronized levels if fullAnalysis is available
  const currentTf: Timeframe = (timeframe as Timeframe) || '1W';
  const tfConfig = TIMEFRAME_CONFIGS[currentTf] || TIMEFRAME_CONFIGS['1W'];
  const tfData = fullAnalysis ? getActiveTimeframeData(fullAnalysis, currentTf) : null;

  const activeSupports = tfData?.supportLevels || indicators.supportLevels || [];
  const activeResistances = tfData?.resistanceLevels || indicators.resistanceLevels || [];
  const activeExpectedMove = tfData?.expectedMovePercent || indicators.atrVolatility?.expectedMovePercent7Days || tfConfig.volatilityPct;

  const ema20Num = parseNum(indicators.movingAverages?.ema20);
  const ema50Num = parseNum(indicators.movingAverages?.ema50);
  const ema200Num = parseNum(indicators.movingAverages?.ema200);

  const getDistancePercent = (base: number, target: number) => {
    if (!base || !target || base === 0) return null;
    const diff = ((target - base) / base) * 100;
    return diff;
  };

  // RSI Calculations
  const rsiValue = indicators.rsi14?.value || 50;
  const getRsiColor = (val: number) => {
    if (val >= 70) return 'text-rose-700 bg-rose-50 border-rose-300';
    if (val <= 30) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    return 'text-blue-700 bg-blue-50 border-blue-300';
  };

  const getMacdBadge = (status: string) => {
    if (status?.includes('ALCISTA')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (status?.includes('BAJISTA')) return 'bg-rose-100 text-rose-800 border-rose-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const getEmaSignalBadge = (signal: string) => {
    if (signal === 'ALCISTA') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (signal === 'BAJISTA') return 'bg-rose-100 text-rose-800 border-rose-300';
    return 'bg-amber-100 text-amber-800 border-amber-300';
  };

  // Quantitative Consensus Calculation
  let bullSignals = 0;
  let totalSignals = 5;

  if (rsiValue >= 45 && rsiValue <= 68) bullSignals++;
  if (indicators.macd?.status?.includes('ALCISTA')) bullSignals++;
  if (indicators.movingAverages?.signal === 'ALCISTA') bullSignals++;
  if (numCurrentPrice > 0 && ema20Num > 0 && numCurrentPrice >= ema20Num * 0.99) bullSignals++;
  if (indicators.volumeTrend?.includes('ALCISTA') || (indicators.stochastic?.value || 50) > 50) bullSignals++;

  const consensusScore = Math.round((bullSignals / totalSignals) * 100);

  // Price channel calculation for visual ruler based on active timeframe supports & resistances
  const allSupports = activeSupports.map(s => parseNum(s.price)).filter(n => n > 0);
  const allResistances = activeResistances.map(r => parseNum(r.price)).filter(n => n > 0);
  
  const minChannel = allSupports.length > 0 ? Math.min(...allSupports) : (numCurrentPrice * 0.96 || 0);
  const maxChannel = allResistances.length > 0 ? Math.max(...allResistances) : (numCurrentPrice * 1.06 || 100);
  const channelSpan = maxChannel - minChannel;
  const priceChannelPercent = channelSpan > 0 && numCurrentPrice > 0
    ? Math.min(Math.max(((numCurrentPrice - minChannel) / channelSpan) * 100, 5), 95)
    : 50;

  const isFridayClose = marketQuote?.priceSource === 'FRIDAY_CLOSE' || !marketQuote?.isMarketOpen;

  return (
    <div id="tablero-indicadores-tecnicos" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-8">
      {/* Section Header with Live Market Sync Indicator & Timeframe Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-5 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-950 flex items-center gap-2">
                Tablero de Indicadores Técnicos y Precios Actuales
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Calibrado cuantitativo para <strong className="text-emerald-700 font-bold">{tfConfig.label} ({tfConfig.sublabel})</strong> según cotización {isFridayClose ? 'de cierre del viernes' : 'en tiempo real'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Timeframe Tag */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-black text-emerald-900 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            <span>Marco: {tfConfig.label}</span>
          </div>

          {/* Price & Sync Badge */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <span>Base: <strong className="text-slate-900">${numCurrentPrice > 0 ? numCurrentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : currentPrice} {currency}</strong></span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isFridayClose ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'}`}>
              {isFridayClose ? 'Cierre Viernes' : 'En Vivo'}
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-purple-600" />
            Volatilidad {tfConfig.label}: <strong className="text-slate-900">{activeExpectedMove}</strong>
          </span>
        </div>
      </div>

      {/* Summary Banner: Quantitative Consensus & Channel Position */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-xl p-4 sm:p-5 mb-6 shadow-md border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Quantitative Consensus */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Consenso Cuantitativo ({tfConfig.label}):
              </span>
              <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/70 border border-emerald-600/40 px-2 py-0.5 rounded">
                {bullSignals} de {totalSignals} Señales Alcistas ({consensusScore}%)
              </span>
            </div>
            <div className="w-full bg-slate-700/80 h-3 rounded-full overflow-hidden p-0.5 border border-slate-600">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  consensusScore >= 70 ? 'bg-emerald-400' : consensusScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${Math.max(consensusScore, 10)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-300">
              {consensusScore >= 70 
                ? `Alineación cuantitativa sólida de indicadores en el horizonte de ${tfConfig.label}.` 
                : consensusScore >= 50 
                ? `Estructura neutral-constructiva en ${tfConfig.label}; requiere confirmación de volumen.` 
                : `Señales mixtas o de debilidad relativa para el marco de ${tfConfig.label}.`}
            </p>
          </div>

          {/* Right: Price Position within Active Timeframe Channel */}
          <div className="space-y-2 bg-slate-800/60 p-3 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">Posición en Canal Técnico ({tfConfig.label}):</span>
              <span className="text-emerald-400 font-mono font-bold">
                {priceChannelPercent.toFixed(0)}% del rango
              </span>
            </div>
            <div className="relative pt-3 pb-1">
              <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden flex">
                <div className="w-1/3 bg-emerald-500/50"></div>
                <div className="w-1/3 bg-blue-500/50"></div>
                <div className="w-1/3 bg-rose-500/50"></div>
              </div>
              {/* Cursor marker for current price */}
              <div 
                className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${priceChannelPercent}%` }}
              >
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-md border-2 border-white"></span>
                <span className="text-[9px] font-mono font-bold text-white bg-slate-900/90 px-1 rounded mt-0.5">
                  ${numCurrentPrice > 0 ? numCurrentPrice.toFixed(1) : currentPrice}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Soporte: ${minChannel.toFixed(1)}</span>
              <span>Resistencia: ${maxChannel.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 4 Core Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 1. RSI (14) */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                RSI (14 Periodos)
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getRsiColor(rsiValue)}`}>
                {indicators.rsi14?.status || 'NEUTRAL'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {rsiValue}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all ${
                  rsiValue >= 70 ? 'bg-rose-500' : rsiValue <= 30 ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(Math.max(rsiValue, 5), 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
            {indicators.rsi14?.interpretation || 'Oscilador de fuerza relativa calibrado al marco de tiempo.'}
          </p>
        </div>

        {/* 2. MACD */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                MACD (12, 26, 9)
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getMacdBadge(indicators.macd?.status)}`}>
                {indicators.macd?.status?.replace('_', ' ') || 'NEUTRAL'}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              {indicators.macd?.status?.includes('ALCISTA') ? (
                <div className="flex items-center text-emerald-600 font-extrabold text-sm gap-1.5">
                  <TrendingUp className="w-5 h-5" /> Cruce Alcista Confirmado
                </div>
              ) : indicators.macd?.status?.includes('BAJISTA') ? (
                <div className="flex items-center text-rose-600 font-extrabold text-sm gap-1.5">
                  <TrendingDown className="w-5 h-5" /> Presión Bajista
                </div>
              ) : (
                <div className="flex items-center text-slate-700 font-bold text-sm gap-1.5">
                  <Compass className="w-5 h-5" /> Fase de Consolidación
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
            {indicators.macd?.interpretation || 'Medición del momentum a través de la relación de medias móviles exponenciales.'}
          </p>
        </div>

        {/* 3. Medias Móviles con Distancia a Precio Actual */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Medias Móviles (EMA)
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getEmaSignalBadge(indicators.movingAverages?.signal)}`}>
                {indicators.movingAverages?.signal || 'ALCISTA'}
              </span>
            </div>
            <div className="space-y-1.5 mb-2 text-xs font-semibold">
              {/* EMA 20 */}
              <div className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-emerald-700 font-bold">EMA 20:</span>
                  <span className="text-slate-900 ml-1 font-extrabold">${indicators.movingAverages?.ema20 || '---'}</span>
                </div>
                {ema20Num > 0 && numCurrentPrice > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${numCurrentPrice >= ema20Num ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {numCurrentPrice >= ema20Num ? '+' : ''}{getDistancePercent(ema20Num, numCurrentPrice)?.toFixed(1)}%
                  </span>
                )}
              </div>

              {/* EMA 50 */}
              <div className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-blue-700 font-bold">EMA 50:</span>
                  <span className="text-slate-900 ml-1 font-extrabold">${indicators.movingAverages?.ema50 || '---'}</span>
                </div>
                {ema50Num > 0 && numCurrentPrice > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${numCurrentPrice >= ema50Num ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>
                    {numCurrentPrice >= ema50Num ? '+' : ''}{getDistancePercent(ema50Num, numCurrentPrice)?.toFixed(1)}%
                  </span>
                )}
              </div>

              {/* EMA 200 */}
              <div className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-purple-700 font-bold">EMA 200:</span>
                  <span className="text-slate-900 ml-1 font-extrabold">${indicators.movingAverages?.ema200 || '---'}</span>
                </div>
                {ema200Num > 0 && numCurrentPrice > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${numCurrentPrice >= ema200Num ? 'bg-purple-50 text-purple-700' : 'bg-rose-50 text-rose-700'}`}>
                    {numCurrentPrice >= ema200Num ? '+' : ''}{getDistancePercent(ema200Num, numCurrentPrice)?.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
            {indicators.movingAverages?.note || 'Alineación de medias móviles respecto al precio actual.'}
          </p>
        </div>

        {/* 4. Bandas de Bollinger & Volumen */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Bollinger & Volumen
              </span>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                Volatilidad
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 mb-2 space-y-1.5">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Posición Bandas:</span>
                <span className="text-indigo-600 font-extrabold">{indicators.bollingerBands?.position?.replace('_', ' ') || 'Banda Media'}</span>
              </div>
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Comportamiento Volumen:</span>
                <span className="text-emerald-700 font-extrabold">{indicators.volumeTrend?.replace('_', ' ') || 'Estable'}</span>
              </div>
              {indicators.stochastic && (
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Estocástico ({indicators.stochastic.value || 50}):</span>
                  <span className="text-blue-600 font-semibold">{indicators.stochastic.status || 'Neutro'}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
            {indicators.bollingerBands?.interpretation || 'Expansión o compresión de volatilidad para el movimiento.'}
          </p>
        </div>
      </div>

      {/* Soportes y Resistencias Sincronizados al Marco Activo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Soportes (Pisos) */}
        <div className="bg-emerald-50/40 rounded-xl border border-emerald-200 p-4">
          <div className="flex items-center justify-between text-emerald-900 font-bold text-xs uppercase tracking-wider mb-3">
            <div className="flex items-center gap-2">
              <Minimize2 className="w-4 h-4 text-emerald-600" />
              <span>Soportes Clave ({tfConfig.label}) - Zonas de Rebote</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
              Pisos Activos
            </span>
          </div>
          <div className="space-y-2">
            {activeSupports.map((sup, idx) => {
              const supNum = parseNum(sup.price);
              const dist = numCurrentPrice > 0 && supNum > 0 ? ((supNum - numCurrentPrice) / numCurrentPrice) * 100 : null;
              return (
                <div key={idx} className="bg-white p-3 rounded-lg border border-emerald-100 flex items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-black text-slate-900 text-sm">${sup.price} {currency}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {sup.strength}
                    </span>
                    {dist !== null && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {dist.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <span className="text-slate-600 text-right font-medium">{sup.note}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resistencias (Techos) */}
        <div className="bg-rose-50/40 rounded-xl border border-rose-200 p-4">
          <div className="flex items-center justify-between text-rose-900 font-bold text-xs uppercase tracking-wider mb-3">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-rose-600" />
              <span>Resistencias a Vencer ({tfConfig.label}) - Zonas de Target</span>
            </div>
            <span className="text-[10px] text-rose-700 font-semibold bg-rose-100 px-2 py-0.5 rounded">
              Techos Técnicos
            </span>
          </div>
          <div className="space-y-2">
            {activeResistances.map((res, idx) => {
              const resNum = parseNum(res.price);
              const dist = numCurrentPrice > 0 && resNum > 0 ? ((resNum - numCurrentPrice) / numCurrentPrice) * 100 : null;
              return (
                <div key={idx} className="bg-white p-3 rounded-lg border border-rose-100 flex items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="font-black text-slate-900 text-sm">${res.price} {currency}</span>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      {res.strength}
                    </span>
                    {dist !== null && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        +{dist.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <span className="text-slate-600 text-right font-medium">{res.note}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
