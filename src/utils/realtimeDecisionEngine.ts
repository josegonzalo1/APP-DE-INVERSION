import { 
  RealtimeDecisionInfo, 
  TimeframeData, 
  VerdictType, 
  Timeframe, 
  AssetAnalysisResult 
} from '../types';
import { buildMultiTimeframeData, TIMEFRAME_CONFIGS } from './timeframeEngine';

/**
 * Evaluates live market pricing against active technical boundaries to yield an institutional
 * real-time execution directive (e.g. In Entry Zone, Wait Pullback, Stop Loss Breach, Target Hit).
 * Crucially adapted to the active timeframe (H1 to 1M).
 */
export function computeRealtimeDecision(
  currentPrice: number,
  tfData: TimeframeData,
  verdict?: VerdictType,
  currency: string = 'USD'
): RealtimeDecisionInfo {
  const activeVerdict: VerdictType = tfData.verdict || verdict || 'COMPRA';

  const targetPrice = typeof tfData.targetPrice?.price === 'number'
    ? tfData.targetPrice.price
    : parseFloat(String(tfData.targetPrice?.price || currentPrice * 1.05)) || currentPrice * 1.05;

  const stopLossPrice = typeof tfData.stopLossSuggested?.price === 'number'
    ? tfData.stopLossSuggested.price
    : parseFloat(String(tfData.stopLossSuggested?.price || currentPrice * 0.96)) || currentPrice * 0.96;

  const entryMin = typeof tfData.optimalEntryRange?.min === 'number'
    ? tfData.optimalEntryRange.min
    : parseFloat(String(tfData.optimalEntryRange?.min || currentPrice * 0.99)) || currentPrice * 0.99;

  const entryMax = typeof tfData.optimalEntryRange?.max === 'number'
    ? tfData.optimalEntryRange.max
    : parseFloat(String(tfData.optimalEntryRange?.max || currentPrice * 1.01)) || currentPrice * 1.01;

  // Real-time distances
  const distanceToTargetPct = currentPrice > 0 
    ? parseFloat((((targetPrice - currentPrice) / currentPrice) * 100).toFixed(2))
    : 0;

  const distanceToStopLossPct = currentPrice > 0 
    ? parseFloat((((currentPrice - stopLossPrice) / currentPrice) * 100).toFixed(2))
    : 0;

  // Real-time live Risk / Reward Ratio
  let liveRiskRewardRatio = tfData.riskRewardRatio || '1:1.50';
  const riskAmount = currentPrice - stopLossPrice;
  const rewardAmount = targetPrice - currentPrice;
  if (riskAmount > 0 && rewardAmount > 0) {
    liveRiskRewardRatio = `1:${(rewardAmount / riskAmount).toFixed(2)}`;
  } else if (riskAmount <= 0) {
    liveRiskRewardRatio = 'INVALIDADO (Bajo Stop)';
  } else if (rewardAmount <= 0) {
    liveRiskRewardRatio = 'OBJETIVO ALCANZADO';
  }

  // 1. Check if Target reached
  if (currentPrice >= targetPrice) {
    const isShortTerm = tfData.timeframe === 'H1' || tfData.timeframe === 'H2';
    return {
      state: 'TARGET_REACHED',
      badgeLabel: isShortTerm 
        ? `OBJETIVO ${tfData.timeframe} ALCANZADO: TOMA DE BENEFICIOS INMEDIATA`
        : `OBJETIVO ${tfData.timeframe} ALCANZADO: PROTEGER CON TRAILING STOP`,
      badgeColor: 'bg-emerald-600 text-white border-emerald-500 shadow-md',
      badgeBgLight: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      actionDirective: `La cotización ($${currentPrice.toFixed(2)}) ha tocado el precio objetivo de ${tfData.label} ($${targetPrice.toFixed(2)}). Regla táctica: ${
        isShortTerm 
          ? 'Cerrar la orden de scalping y asegurar ganancias en caja.' 
          : 'Tomar 50% de beneficio y ajustar Stop al precio de entrada para dejar correr la tendencia.'
      }`,
      distanceToTargetPct,
      distanceToStopLossPct,
      liveRiskRewardRatio,
      isInOptimalZone: false,
      urgency: 'MODERADA',
      livePrice: currentPrice,
      targetPrice,
      stopLossPrice,
      entryMin,
      entryMax,
    };
  }

  // 2. Check if Stop Loss breached
  if (currentPrice <= stopLossPrice) {
    return {
      state: 'STOP_ALERT',
      badgeLabel: `ALERTA ${tfData.timeframe}: STOP LOSS VULNERADO (INVALIDACIÓN)`,
      badgeColor: 'bg-rose-700 text-white border-rose-600 shadow-md animate-pulse',
      badgeBgLight: 'bg-rose-50 text-rose-950 border-rose-300',
      actionDirective: `El precio ($${currentPrice.toFixed(2)}) perforó el nivel de invalidación para ${tfData.label} ($${stopLossPrice.toFixed(2)}). Regla estricta: Cortar pérdidas inmediatamente o no iniciar posiciones de compra en esta temporalidad.`,
      distanceToTargetPct,
      distanceToStopLossPct,
      liveRiskRewardRatio,
      isInOptimalZone: false,
      urgency: 'ALERTA_RIESGO',
      livePrice: currentPrice,
      targetPrice,
      stopLossPrice,
      entryMin,
      entryMax,
    };
  }

  // 3. Inside Optimal Entry Zone
  const isInOptimalZone = currentPrice >= entryMin && currentPrice <= entryMax;
  if (isInOptimalZone) {
    if (activeVerdict.includes('VENTA')) {
      return {
        state: 'ACTIVE_BUY_ZONE',
        badgeLabel: `ZONA DE DISTRIBUCIÓN / VENTA ACTIVA (${tfData.timeframe})`,
        badgeColor: 'bg-rose-600 text-white font-bold border-rose-500 shadow-md',
        badgeBgLight: 'bg-rose-50 text-rose-950 border-rose-300',
        actionDirective: `El precio cotiza en zona de venta táctica ($${currentPrice.toFixed(2)}). Gatillo de salida activado para ${tfData.label}. Tomar beneficios o iniciar coberturas.`,
        distanceToTargetPct,
        distanceToStopLossPct,
        liveRiskRewardRatio,
        isInOptimalZone: true,
        urgency: 'INMEDIATA',
        livePrice: currentPrice,
        targetPrice,
        stopLossPrice,
        entryMin,
        entryMax,
      };
    }

    if (activeVerdict === 'MANTENER') {
      return {
        state: 'ACTIVE_BUY_ZONE',
        badgeLabel: `RANGO MEDIO: MANTENER / ESPERAR CONFIRMACIÓN (${tfData.timeframe})`,
        badgeColor: 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md',
        badgeBgLight: 'bg-amber-50 text-amber-950 border-amber-300',
        actionDirective: `Precio en $${currentPrice.toFixed(2)}, dentro de la franja neutral de ${tfData.label}. Esperar señal de volumen confirmatoria antes de colocar órdenes.`,
        distanceToTargetPct,
        distanceToStopLossPct,
        liveRiskRewardRatio,
        isInOptimalZone: true,
        urgency: 'MODERADA',
        livePrice: currentPrice,
        targetPrice,
        stopLossPrice,
        entryMin,
        entryMax,
      };
    }

    // Default: Bullish Buy Zone
    const tfDirectivePrefix = tfData.timeframe === 'H1'
      ? 'Micro-entrada en scalping horaria: disparar orden con spread ajustado hacia VWAP.'
      : tfData.timeframe === 'H2' || tfData.timeframe === 'H4'
      ? 'Entrada intradía sólida: el precio sostiene el soporte del bloque de sesión.'
      : tfData.timeframe === '1D'
      ? 'Entrada de Day Trading en sesión regular: ratio riesgo/beneficio favorable.'
      : 'Zona de acumulación institucional favorable para el horizonte activo.';

    return {
      state: 'ACTIVE_BUY_ZONE',
      badgeLabel: `OPORTUNIDAD ACTIVA: EN ZONA ÓPTIMA DE COMPRA (${tfData.timeframe})`,
      badgeColor: 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md',
      badgeBgLight: 'bg-emerald-50 text-emerald-950 border-emerald-400',
      actionDirective: `El activo cotiza en $${currentPrice.toFixed(2)}, franja ideal ($${entryMin.toFixed(2)} - $${entryMax.toFixed(2)}). Asimetría R/B favorable (${liveRiskRewardRatio}). ${tfDirectivePrefix}`,
      distanceToTargetPct,
      distanceToStopLossPct,
      liveRiskRewardRatio,
      isInOptimalZone: true,
      urgency: 'INMEDIATA',
      livePrice: currentPrice,
      targetPrice,
      stopLossPrice,
      entryMin,
      entryMax,
    };
  }

  // 4. Overextended past entry zone (price > entryMax)
  if (currentPrice > entryMax) {
    const spreadPct = (((currentPrice - entryMax) / entryMax) * 100).toFixed(1);
    return {
      state: 'PULLBACK_WAIT',
      badgeLabel: `ESPERAR RETROCESO (${tfData.timeframe}: +${spreadPct}% sobre entrada)`,
      badgeColor: 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md',
      badgeBgLight: 'bg-amber-50 text-amber-950 border-amber-300',
      actionDirective: `El precio ($${currentPrice.toFixed(2)}) superó el techo óptimo de ${tfData.label} ($${entryMax.toFixed(2)}). Regla profesional: No perseguir el precio al alza. Esperar retroceso hacia la media de ${tfData.timeframe} para mejor precio de entrada.`,
      distanceToTargetPct,
      distanceToStopLossPct,
      liveRiskRewardRatio,
      isInOptimalZone: false,
      urgency: 'ESPERAR_RETROCESO',
      livePrice: currentPrice,
      targetPrice,
      stopLossPrice,
      entryMin,
      entryMax,
    };
  }

  // 5. Discount / Testing Support (below entryMin, but above stopLoss)
  return {
    state: 'DISCOUNT_TEST',
    badgeLabel: `TESTEO DE SOPORTE: OPORTUNIDAD EN DESCUENTO (${tfData.timeframe})`,
    badgeColor: 'bg-blue-600 text-white border-blue-500 shadow-md',
    badgeBgLight: 'bg-blue-50 text-blue-950 border-blue-300',
    actionDirective: `Cotizando en $${currentPrice.toFixed(2)}, con descuento táctico sobre el rango de ${tfData.label} y margen seguro sobre el Stop Loss ($${stopLossPrice.toFixed(2)}). Confirmar rebote con volumen para ejecutar compra asimétrica.`,
    distanceToTargetPct,
    distanceToStopLossPct,
    liveRiskRewardRatio,
    isInOptimalZone: false,
    urgency: 'MODERADA',
    livePrice: currentPrice,
    targetPrice,
    stopLossPrice,
    entryMin,
    entryMax,
  };
}

export interface TimeframeConfluenceItem {
  timeframe: Timeframe;
  label: string;
  sublabel: string;
  bias: 'ALCISTA' | 'BAJISTA' | 'NEUTRAL';
  signalText: string;
  confidence: number;
  nearestLevel: string;
  verdict: VerdictType;
  verdictLabel: string;
  tradingStyle: string;
  holdingPeriod: string;
  buyTriggerRule: string;
  sellTriggerRule: string;
  entryRangeText: string;
  targetPriceText: string;
  stopLossText: string;
  riskRewardRatio: string;
}

export interface ConfluenceReport {
  score: number; // 0 - 100
  bullishCount: number;
  totalTimeframes: number;
  verdictTitle: string;
  verdictSummary: string;
  badgeBg: string;
  items: TimeframeConfluenceItem[];
}

/**
 * Calculates multi-timeframe alignment across H1, H2, H4, 1D, 1W, and 1M
 * to provide an institutional confluence score and full comparative decision matrix.
 */
export function computeMultiTimeframeConfluence(
  analysis: AssetAnalysisResult,
  currentPrice: number
): ConfluenceReport {
  const allTf = buildMultiTimeframeData(analysis);
  const timeframes: Timeframe[] = ['H1', 'H2', 'H4', '1D', '1W', '1M'];
  
  const items: TimeframeConfluenceItem[] = [];
  let bullishCount = 0;

  for (const tf of timeframes) {
    const data = allTf[tf];
    const targetPrice = Number(data.targetPrice?.price) || currentPrice * 1.05;
    const stopLoss = Number(data.stopLossSuggested?.price) || currentPrice * 0.96;
    const s1 = data.supportLevels?.[0]?.price ? Number(data.supportLevels[0].price) : currentPrice * 0.99;
    const r1 = data.resistanceLevels?.[0]?.price ? Number(data.resistanceLevels[0].price) : currentPrice * 1.02;

    const tfVerdict: VerdictType = data.verdict || 'COMPRA';
    let bias: 'ALCISTA' | 'BAJISTA' | 'NEUTRAL' = 'ALCISTA';

    if (tfVerdict.includes('VENTA')) {
      bias = 'BAJISTA';
    } else if (tfVerdict === 'MANTENER') {
      bias = 'NEUTRAL';
    } else {
      bias = 'ALCISTA';
      bullishCount++;
    }

    const entryRangeText = data.optimalEntryRange 
      ? `$${data.optimalEntryRange.min} - $${data.optimalEntryRange.max}`
      : `$${(currentPrice * 0.99).toFixed(2)} - $${(currentPrice * 1.01).toFixed(2)}`;

    const targetPriceText = data.targetPrice
      ? `$${data.targetPrice.price} (+${data.targetPrice.potentialGainPercent}%)`
      : `$${targetPrice.toFixed(2)}`;

    const stopLossText = data.stopLossSuggested
      ? `$${data.stopLossSuggested.price} (-${data.stopLossSuggested.potentialLossPercent}%)`
      : `$${stopLoss.toFixed(2)}`;

    items.push({
      timeframe: tf,
      label: TIMEFRAME_CONFIGS[tf]?.label || data.label,
      sublabel: TIMEFRAME_CONFIGS[tf]?.sublabel || data.sublabel,
      bias,
      signalText: data.outlook,
      confidence: data.confidenceScore || 82,
      nearestLevel: `Soporte: $${s1.toFixed(2)} | Resistencia: $${r1.toFixed(2)}`,
      verdict: tfVerdict,
      verdictLabel: data.verdictLabel || `${tfVerdict} (${tf})`,
      tradingStyle: data.tradingStyle || TIMEFRAME_CONFIGS[tf]?.tradingStyle || '',
      holdingPeriod: data.holdingPeriod || TIMEFRAME_CONFIGS[tf]?.holdingPeriod || '',
      buyTriggerRule: data.buyTriggerRule || `Entrada en soporte $${s1.toFixed(2)}`,
      sellTriggerRule: data.sellTriggerRule || `Toma de beneficio en $${targetPrice.toFixed(2)}`,
      entryRangeText,
      targetPriceText,
      stopLossText,
      riskRewardRatio: data.riskRewardRatio || '1:2.0',
    });
  }

  const score = Math.round((bullishCount / timeframes.length) * 100);

  let verdictTitle = 'CONVERGENCIA ALCISTA DE ALTA CONVICCIÓN';
  let verdictSummary = `Alineación cuantitativa: ${bullishCount} de 6 marcos de tiempo (desde H1 hasta 1M) favorecen compras. Los horizontes rápidos están respaldados por el ciclo mayor.`;
  let badgeBg = 'bg-emerald-500 text-slate-950 font-black';

  if (score >= 80) {
    verdictTitle = 'CONVERGENCIA ALCISTA DE ALTA CONVICCIÓN (80%+ CONFLUENCIA)';
    verdictSummary = `${bullishCount}/6 temporalidades alineadas al alza. Máxima probabilidad estadística para compras en cualquier horizonte (H1 a 1M).`;
    badgeBg = 'bg-emerald-500 text-slate-950 font-black';
  } else if (score >= 50) {
    verdictTitle = 'DIVERGENCIA TÁCTICA ENTRE MARCOS TEMPORALES';
    verdictSummary = `${bullishCount}/6 marcos al alza. Las decisiones difieren según el horizonte: marcos cortos (H1/H2) pueden requerir espera o scalping, mientras el ciclo semanal/mensual mantiene tendencia.`;
    badgeBg = 'bg-amber-500 text-slate-950 font-black';
  } else {
    verdictTitle = 'PREDOMINIO BAJISTA O CONSOLIDACIÓN DEFENSIVA';
    verdictSummary = `Solo ${bullishCount}/6 marcos al alza. Precaución: descartar compras en temporalidades intradía salvo confirmación de soporte.`;
    badgeBg = 'bg-rose-500 text-white font-bold';
  }

  return {
    score,
    bullishCount,
    totalTimeframes: timeframes.length,
    verdictTitle,
    verdictSummary,
    badgeBg,
    items,
  };
}

/**
 * Institutional Position Sizing & Risk Management formula
 */
export function calculateTacticalPositionSize(
  capital: number,
  riskPercent: number,
  livePrice: number,
  stopLossPrice: number,
  targetPrice: number
) {
  const maxRiskDollars = (capital * riskPercent) / 100;
  const riskPerUnit = Math.max(0.01, Math.abs(livePrice - stopLossPrice));
  const potentialGainPerUnit = Math.max(0.01, Math.abs(targetPrice - livePrice));

  const recommendedUnits = Math.max(1, Math.floor(maxRiskDollars / riskPerUnit));
  const totalInvestmentDollars = recommendedUnits * livePrice;
  const portfolioAllocationPct = Math.min(100, (totalInvestmentDollars / capital) * 100);
  const potentialNetGainDollars = recommendedUnits * potentialGainPerUnit;
  const realRiskRewardRatio = potentialNetGainDollars / Math.max(0.01, maxRiskDollars);

  return {
    capital,
    riskPercent,
    maxRiskDollars: parseFloat(maxRiskDollars.toFixed(2)),
    recommendedUnits,
    totalInvestmentDollars: parseFloat(totalInvestmentDollars.toFixed(2)),
    portfolioAllocationPct: parseFloat(portfolioAllocationPct.toFixed(1)),
    potentialNetGainDollars: parseFloat(potentialNetGainDollars.toFixed(2)),
    realRiskRewardRatio: `1:${realRiskRewardRatio.toFixed(2)}`,
    stopLossPrice,
    targetPrice,
    livePrice,
  };
}
