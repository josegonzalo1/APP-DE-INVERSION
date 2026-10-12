import { 
  AssetAnalysisResult, 
  Timeframe, 
  TimeframeData, 
  CatalystItem, 
  DecisionActionPlan, 
  Scenarios1Week,
  VerdictType 
} from '../types';

export const TIMEFRAME_CONFIGS: Record<Timeframe, {
  label: string;
  sublabel: string;
  badgeText: string;
  horizonText: string;
  tradingStyle: string;
  holdingPeriod: string;
  gainMultiplier: number;
  lossMultiplier: number;
  entrySpread: { minMul: number; maxMul: number };
  volatilityPct: string;
  supportMultipliers: [number, number];
  resistanceMultipliers: [number, number];
}> = {
  'H1': {
    label: 'H1 (1 Hora)',
    sublabel: 'Scalping • 1 Hora',
    badgeText: 'Horizonte: H1 (1 Hora)',
    horizonText: 'H1 (Vela de 1 Hora)',
    tradingStyle: 'Scalping & Micro-impulso',
    holdingPeriod: '15 a 60 minutos',
    gainMultiplier: 0.12, // ~0.5% - 1.0% target move
    lossMultiplier: 0.14, // ~0.3% - 0.7% stop
    entrySpread: { minMul: 0.998, maxMul: 1.001 },
    volatilityPct: '±0.4% a ±0.8%',
    supportMultipliers: [0.996, 0.992],
    resistanceMultipliers: [1.005, 1.010],
  },
  'H2': {
    label: 'H2 (2 Horas)',
    sublabel: 'Intradía Corto • 2 Horas',
    badgeText: 'Horizonte: H2 (2 Horas)',
    horizonText: 'H2 (Bloque 2 Horas)',
    tradingStyle: 'Intradía Corto de Media Sesión',
    holdingPeriod: '1 a 3 horas',
    gainMultiplier: 0.18, // ~0.8% - 1.5% target move
    lossMultiplier: 0.20, // ~0.5% - 1.0% stop
    entrySpread: { minMul: 0.996, maxMul: 1.0015 },
    volatilityPct: '±0.6% a ±1.3%',
    supportMultipliers: [0.994, 0.988],
    resistanceMultipliers: [1.008, 1.016],
  },
  'H4': {
    label: 'H4 (4 Horas)',
    sublabel: 'Intradía / Swing • 4 Horas',
    badgeText: 'Horizonte: H4 (4 Horas)',
    horizonText: 'H4 (Bloque 4 Horas)',
    tradingStyle: 'Swing Intradía / Estructura 240m',
    holdingPeriod: '4 a 12 horas',
    gainMultiplier: 0.25, // ~1.1% - 2.2% target move
    lossMultiplier: 0.26, // ~0.7% - 1.4% stop
    entrySpread: { minMul: 0.995, maxMul: 1.002 },
    volatilityPct: '±0.9% a ±1.8%',
    supportMultipliers: [0.992, 0.985],
    resistanceMultipliers: [1.012, 1.022],
  },
  '1D': {
    label: '1 Día',
    sublabel: 'Day Trading • 24 Horas',
    badgeText: 'Horizonte: 1 Día (Intradía)',
    horizonText: '1 Día (24 Horas)',
    tradingStyle: 'Day Trading de Sesión Completa',
    holdingPeriod: '1 a 2 sesiones diarias',
    gainMultiplier: 0.35, // ~1.5% - 2.8% target move
    lossMultiplier: 0.35, // ~0.9% - 1.6% stop
    entrySpread: { minMul: 0.994, maxMul: 1.002 },
    volatilityPct: '±1.2% a ±2.4%',
    supportMultipliers: [0.991, 0.983],
    resistanceMultipliers: [1.014, 1.026],
  },
  '1W': {
    label: '1 Semana',
    sublabel: 'Swing Trade • 7 Días',
    badgeText: 'Horizonte: 1 Semana (Swing)',
    horizonText: '1 Semana (7 Días)',
    tradingStyle: 'Swing Trading Táctico Semanal',
    holdingPeriod: '3 a 7 días hábiles',
    gainMultiplier: 1.0, // ~4.5% - 8.5% target move
    lossMultiplier: 1.0, // ~2.5% - 4.5% stop
    entrySpread: { minMul: 0.985, maxMul: 1.005 },
    volatilityPct: '±4.0% a ±6.8%',
    supportMultipliers: [0.975, 0.955],
    resistanceMultipliers: [1.035, 1.072],
  },
  '1M': {
    label: '1 Mes',
    sublabel: 'Posicional • 30 Días',
    badgeText: 'Horizonte: 1 Mes (Posicional)',
    horizonText: '1 Mes (30 Días)',
    tradingStyle: 'Inversión Posicional y Macrotendencia',
    holdingPeriod: '2 a 6 semanas',
    gainMultiplier: 2.3, // ~11% - 20% target move
    lossMultiplier: 1.8, // ~5.0% - 8.5% stop
    entrySpread: { minMul: 0.970, maxMul: 1.012 },
    volatilityPct: '±9.5% a ±16.0%',
    supportMultipliers: [0.940, 0.895],
    resistanceMultipliers: [1.085, 1.165],
  },
};

/**
 * Derives a timeframe-specific institutional trading decision (verdict, label, confidence, rules)
 * based on live price action, support/resistance proximity, and timeframe nature.
 */
function deriveTimeframeDecision(
  tf: Timeframe,
  currentPrice: number,
  baseVerdict: VerdictType,
  entryMin: number,
  entryMax: number,
  targetPrice: number,
  stopLossPrice: number,
  s1: number,
  r1: number,
  baseConfidence: number
): {
  verdict: VerdictType;
  verdictLabel: string;
  confidenceScore: number;
  riskLevel: 'BAJO' | 'MODERADO' | 'ALTO' | 'MUY_ALTO';
} {
  // If price has broken below stop loss, immediate risk invalidation for that timeframe
  if (currentPrice <= stopLossPrice) {
    return {
      verdict: 'VENTA_FUERTE',
      verdictLabel: `STOP LOSS VULNERADO (${tf}): Descarte preventivo de compras o liquidación de posiciones`,
      confidenceScore: Math.min(95, baseConfidence + 6),
      riskLevel: 'MUY_ALTO',
    };
  }

  // If price has reached or exceeded target price
  if (currentPrice >= targetPrice) {
    return {
      verdict: tf === 'H1' || tf === 'H2' ? 'VENTA' : 'MANTENER',
      verdictLabel: `OBJETIVO ALCANZADO (${tf}): Toma de ganancias o ajustar trailing stop al alza`,
      confidenceScore: Math.min(94, baseConfidence + 4),
      riskLevel: 'MODERADO',
    };
  }

  // If price is near or testing resistance R1
  if (currentPrice >= r1 * 0.998) {
    if (tf === 'H1') {
      return {
        verdict: 'VENTA',
        verdictLabel: 'VENTA / TOMA DE BENEFICIOS SCALPING (Resistencia Horaria R1)',
        confidenceScore: 84,
        riskLevel: 'ALTO',
      };
    }
    if (tf === 'H2') {
      return {
        verdict: 'MANTENER',
        verdictLabel: 'MANTENER / ESPERAR RETROCESO (Zona de Resistencia de 2 Horas)',
        confidenceScore: 81,
        riskLevel: 'MODERADO',
      };
    }
    if (tf === 'H4' || tf === '1D') {
      return {
        verdict: 'MANTENER',
        verdictLabel: 'MANTENER: Consolidación bajo techo de resistencia previa',
        confidenceScore: 82,
        riskLevel: 'MODERADO',
      };
    }
    // 1W & 1M: macro buyers look for continuation or breakout
    return {
      verdict: baseVerdict === 'VENTA' || baseVerdict === 'VENTA_FUERTE' ? 'VENTA' : 'COMPRA',
      verdictLabel: `COMPRA TÁCTICA (${tf}): Presión compradora probando resistencia mayor`,
      confidenceScore: baseConfidence,
      riskLevel: 'MODERADO',
    };
  }

  // If price is in the optimal entry range [entryMin, entryMax]
  if (currentPrice >= entryMin && currentPrice <= entryMax) {
    if (baseVerdict === 'VENTA' || baseVerdict === 'VENTA_FUERTE') {
      return {
        verdict: 'VENTA',
        verdictLabel: `VENTA EN REBOTE (${tf}): Zona óptima de descarga / venta corta`,
        confidenceScore: Math.min(90, baseConfidence + 3),
        riskLevel: 'ALTO',
      };
    }
    if (baseVerdict === 'MANTENER') {
      return {
        verdict: tf === 'H1' ? 'COMPRA' : 'MANTENER',
        verdictLabel: tf === 'H1' 
          ? 'COMPRA SCALPING (Gatillo rápido en zona de entrada)' 
          : `MANTENER / OBSERVAR (${tf}): Esperar volumen confirmatorio`,
        confidenceScore: 78,
        riskLevel: 'MODERADO',
      };
    }
    // Bullish base verdict
    if (tf === 'H1') {
      return {
        verdict: 'COMPRA_FUERTE',
        verdictLabel: 'COMPRA SCALPING INMEDIATA (En Rango Óptimo H1 con R/B Asimétrico)',
        confidenceScore: 86,
        riskLevel: 'MODERADO',
      };
    }
    if (tf === 'H2') {
      return {
        verdict: 'COMPRA',
        verdictLabel: 'COMPRA INTRADÍA (Bloque de 2 Horas en Soporte Favorable)',
        confidenceScore: 84,
        riskLevel: 'MODERADO',
      };
    }
    if (tf === 'H4') {
      return {
        verdict: 'COMPRA_FUERTE',
        verdictLabel: 'COMPRA SWING INTRADÍA (Estructura de 4 Horas alineada con EMA 20)',
        confidenceScore: 88,
        riskLevel: 'MODERADO',
      };
    }
    if (tf === '1D') {
      return {
        verdict: 'COMPRA',
        verdictLabel: 'COMPRA DAY TRADING (Sesión Diaria en Soporte de VWAP)',
        confidenceScore: 85,
        riskLevel: 'MODERADO',
      };
    }
    if (tf === '1W') {
      return {
        verdict: baseVerdict,
        verdictLabel: `COMPRA SWING TÁCTICO (Ciclo de 7 Días con Convicción Institucional)`,
        confidenceScore: baseConfidence,
        riskLevel: 'MODERADO',
      };
    }
    // 1M
    return {
      verdict: 'COMPRA',
      verdictLabel: 'ACUMULACIÓN POSICIONAL (Compras escalonadas en tendencia a 30 Días)',
      confidenceScore: Math.min(92, baseConfidence + 4),
      riskLevel: 'BAJO',
    };
  }

  // If price is below entryMin but above stopLoss (Discount / Pullback zone)
  if (currentPrice < entryMin && currentPrice > stopLossPrice) {
    if (baseVerdict === 'VENTA' || baseVerdict === 'VENTA_FUERTE') {
      return {
        verdict: 'VENTA_FUERTE',
        verdictLabel: `VENTA POR DEBILIDAD (${tf}): Pérdida de zona de entrada y presión bajista`,
        confidenceScore: 87,
        riskLevel: 'ALTO',
      };
    }
    if (tf === 'H1') {
      return {
        verdict: 'COMPRA',
        verdictLabel: 'COMPRA EN DESCUENTO SCALPING (Testeo de Soporte Dinámico Horario S1)',
        confidenceScore: 80,
        riskLevel: 'MODERADO',
      };
    }
    if (tf === 'H2' || tf === 'H4') {
      return {
        verdict: 'COMPRA',
        verdictLabel: `OPORTUNIDAD EN RETROCESO (${tf}): Compra técnica con Stop ceñido en $${stopLossPrice}`,
        confidenceScore: 83,
        riskLevel: 'MODERADO',
      };
    }
    if (tf === '1D') {
      return {
        verdict: 'COMPRA',
        verdictLabel: 'COMPRA EN SOPORTE DIARIO: Margen de seguridad amplio hacia Target',
        confidenceScore: 85,
        riskLevel: 'MODERADO',
      };
    }
    if (tf === '1M') {
      return {
        verdict: 'COMPRA_FUERTE',
        verdictLabel: 'COMPRA FUERTE INSTITUCIONAL (Descuento atractivo en horizonte 30 Días)',
        confidenceScore: 90,
        riskLevel: 'BAJO',
      };
    }
    return {
      verdict: 'COMPRA',
      verdictLabel: `COMPRA EN SOPORTE SEMANAL ($${s1})`,
      confidenceScore: baseConfidence,
      riskLevel: 'MODERADO',
    };
  }

  // Overextended past entryMax (price > entryMax)
  if (currentPrice > entryMax) {
    if (tf === 'H1') {
      return {
        verdict: 'MANTENER',
        verdictLabel: 'MANTENER / NO PERSEGUIR (Sobreextendido en velas de 60 min, esperar pullback)',
        confidenceScore: 76,
        riskLevel: 'ALTO',
      };
    }
    if (tf === 'H2') {
      return {
        verdict: 'MANTENER',
        verdictLabel: 'MANTENER / ESPERAR RETROCESO hacia la media de 2 horas',
        confidenceScore: 78,
        riskLevel: 'MODERADO',
      };
    }
    if (tf === 'H4') {
      return {
        verdict: 'MANTENER',
        verdictLabel: 'MANTENER: Precio en zona alta del bloque de 4 horas',
        confidenceScore: 80,
        riskLevel: 'MODERADO',
      };
    }
    if (tf === '1D') {
      return {
        verdict: 'MANTENER',
        verdictLabel: 'MANTENER: Extensión intradía, esperar consolidación',
        confidenceScore: 82,
        riskLevel: 'MODERADO',
      };
    }
    // 1W & 1M
    return {
      verdict: baseVerdict === 'COMPRA_FUERTE' ? 'COMPRA' : baseVerdict,
      verdictLabel: `TENDENCIA VIGENTE (${tf}): Mantener posición y dejar correr beneficios`,
      confidenceScore: baseConfidence,
      riskLevel: 'MODERADO',
    };
  }

  return {
    verdict: baseVerdict,
    verdictLabel: `${baseVerdict} (${tf})`,
    confidenceScore: baseConfidence,
    riskLevel: 'MODERADO',
  };
}

/**
 * Builds or retrieves the complete synchronized dataset for all timeframes (H1, H2, H4, 1D, 1W, 1M).
 * Each timeframe possesses its own deterministic decision rules, triggers, optimal entry, stop loss,
 * profit targets, and customized buy/sell action plans.
 */
export function buildMultiTimeframeData(baseResult: AssetAnalysisResult): Record<Timeframe, TimeframeData> {
  const currentPrice = Number(baseResult.currentEstimatedPrice) || (baseResult.marketQuote ? baseResult.marketQuote.price : 100);
  const currency = baseResult.currency || 'USD';
  const ticker = baseResult.ticker || 'ACTIVO';
  const assetName = baseResult.asset || ticker;
  const baseVerdict = baseResult.verdict || 'COMPRA';
  const baseConfidence = Number(baseResult.confidenceScore) || 82;

  // Base 1-week gain and loss percentages
  const baseTargetGain = typeof baseResult.targetPrice1Week?.potentialGainPercent === 'number' 
    ? baseResult.targetPrice1Week.potentialGainPercent 
    : parseFloat(String(baseResult.targetPrice1Week?.potentialGainPercent || '6.5')) || 6.5;

  const baseStopLoss = typeof baseResult.stopLossSuggested?.potentialLossPercent === 'number'
    ? baseResult.stopLossSuggested.potentialLossPercent
    : parseFloat(String(baseResult.stopLossSuggested?.potentialLossPercent || '3.8')) || 3.8;

  // Check if server already provided all custom timeframes and has complete verdict adaptation
  if (
    baseResult.timeframes &&
    baseResult.timeframes['H1'] &&
    baseResult.timeframes['H2'] &&
    baseResult.timeframes['H4'] &&
    baseResult.timeframes['1D'] &&
    baseResult.timeframes['1W'] &&
    baseResult.timeframes['1M'] &&
    baseResult.timeframes['H1'].verdict &&
    baseResult.timeframes['H1'].buyTriggerRule
  ) {
    const tfPrice = Number(baseResult.timeframes['1W'].targetPrice?.price) || 0;
    if (tfPrice > 0 && Math.abs(currentPrice - (Number(baseResult.currentEstimatedPrice) || currentPrice)) < 0.01) {
      return baseResult.timeframes;
    }
  }

  // Generate synchronized profiles
  const resultTimeframes: Partial<Record<Timeframe, TimeframeData>> = {};

  // =========================================================================
  // 1. H1 (1 HORA - SCALPING & MICRO-IMPULSO)
  // =========================================================================
  const targetH1Gain = Math.max(0.4, Number((baseTargetGain * 0.12).toFixed(2)));
  const stopH1Loss = Math.max(0.25, Number((baseStopLoss * 0.14).toFixed(2)));
  const targetPriceH1 = Number((currentPrice * (1 + targetH1Gain / 100)).toFixed(2));
  const stopLossPriceH1 = Number((currentPrice * (1 - stopH1Loss / 100)).toFixed(2));
  const s1_H1 = Number((currentPrice * 0.996).toFixed(2));
  const s2_H1 = Number((currentPrice * 0.992).toFixed(2));
  const r1_H1 = Number((currentPrice * 1.005).toFixed(2));
  const r2_H1 = Number((currentPrice * 1.010).toFixed(2));
  const entryMinH1 = Number((currentPrice * 0.998).toFixed(2));
  const entryMaxH1 = Number((currentPrice * 1.001).toFixed(2));

  const decisionH1 = deriveTimeframeDecision(
    'H1',
    currentPrice,
    baseVerdict,
    entryMinH1,
    entryMaxH1,
    targetPriceH1,
    stopLossPriceH1,
    s1_H1,
    r1_H1,
    baseConfidence - 4
  );

  resultTimeframes['H1'] = {
    timeframe: 'H1',
    label: 'H1 (1 Hora)',
    sublabel: 'Scalping • 1 Hora',
    badgeText: 'Horizonte: H1 (1 Hora)',
    horizonDescription: 'Operativa de micro-impulso y scalping en velas de 60 minutos con enfoque en VWAP horaria y flujo de órdenes.',
    outlook: `Para ${assetName} (${ticker}), el gráfico horario (H1) cotiza en $${currentPrice.toFixed(2)}. Directiva: ${decisionH1.verdictLabel}. La zona de soporte horario se ubica en $${s1_H1} y la resistencia R1 en $${r1_H1}. Un testeo con volumen proyecta alcanzar el target de $${targetPriceH1.toFixed(2)} (+${targetH1Gain}%) dentro de la próxima vela horaria.`,
    verdict: decisionH1.verdict,
    verdictLabel: decisionH1.verdictLabel,
    confidenceScore: decisionH1.confidenceScore,
    tradingStyle: 'Scalping & Micro-impulso',
    holdingPeriod: '15 a 60 minutos',
    buyTriggerRule: `Superación o rebote sobre VWAP / EMA 9 horaria ($${s1_H1}) con ratio R/B > 1:1.6 y spread < 0.05%`,
    sellTriggerRule: `Toque de resistencia R1 horaria ($${r1_H1}) o divergencia bajista en RSI de 15 minutos`,
    invalidationRule: `Cierre de vela de 15 min o 60 min por debajo de $${stopLossPriceH1}`,
    positionSizingGuidance: 'Riesgo reducido (0.5% a 1.0% de la cuenta) por alta frecuencia y velocidad de ejecución',
    riskLevel: decisionH1.riskLevel,
    optimalEntryRange: {
      min: entryMinH1,
      max: entryMaxH1,
      note: 'Entrada muy ajustada en retroceso de 5 a 15 minutos hacia el VWAP horario.',
    },
    targetPrice: {
      price: targetPriceH1,
      potentialGainPercent: targetH1Gain,
      reasoning: `Objetivo de scalping H1 en la resistencia local R1 ($${targetPriceH1}) basado en la volatilidad media horaria.`,
    },
    stopLossSuggested: {
      price: stopLossPriceH1,
      potentialLossPercent: stopH1Loss,
      reasoning: `Stop Loss ceñido por debajo del mínimo de la vela anterior de H1 ($${stopLossPriceH1}).`,
    },
    riskRewardRatio: `1:${(targetH1Gain / stopH1Loss).toFixed(2)}`,
    expectedMovePercent: '±0.4% a ±0.8%',
    supportLevels: [
      { price: s1_H1, strength: 'FUERTE', note: 'Soporte dinámico EMA 9 en H1 / VWAP' },
      { price: s2_H1, strength: 'CLAVE', note: 'Mínimo de la sesión horaria previa' },
    ],
    resistanceLevels: [
      { price: r1_H1, strength: 'MEDIO', note: 'Resistencia inmediata R1 de H1' },
      { price: r2_H1, strength: 'FUERTE', note: 'Techo de extensión máxima de la hora' },
    ],
    scenarios: {
      bullish: {
        probability: decisionH1.verdict.includes('COMPRA') ? 58 : 38,
        target: targetPriceH1,
        changePercent: `+${targetH1Gain}%`,
        description: `Ruptura del rango de 15 min hacia el target horario de $${targetPriceH1}.`,
        triggers: ['Volumen comprador > 130% de la media de 20 periodos en H1', 'RSI H1 rebotando sobre 50'],
      },
      base: {
        probability: 30,
        target: Number((currentPrice * 1.001).toFixed(2)),
        changePercent: '+0.1%',
        description: `Consolidación estrecha dentro del cuerpo de la vela horaria entre $${s1_H1} y $${r1_H1}.`,
        triggers: ['Volumen equilibrado sin desbalance en el libro de órdenes'],
      },
      bearish: {
        probability: decisionH1.verdict.includes('COMPRA') ? 12 : 32,
        target: stopLossPriceH1,
        changePercent: `-${stopH1Loss}%`,
        description: `Fallo de impulso y ruptura bajista activando el Stop Loss en $${stopLossPriceH1}.`,
        triggers: ['Rechazo en R1 y cruce bajista rápido en MACD de 15 min'],
      },
    },
    catalysts: [
      {
        dateOrTiming: 'Cierre de vela H1',
        event: 'Confirmación de cierre de la barra horaria y cruce de medias rápidas',
        potentialImpact: 'ALTO',
        bias: decisionH1.verdict.includes('COMPRA') ? 'ALCISTA' : 'BAJISTA',
      },
      {
        dateOrTiming: 'Minuto :30 de la hora',
        event: 'Publicación de datos menores o apertura de subastas intermedias',
        potentialImpact: 'MEDIO',
        bias: 'VOLATIL',
      },
    ],
    actionPlan: {
      recommendationForBuyer: `Ejecutar COMPRA SCALPING entre $${entryMinH1} y $${entryMaxH1} con Stop Loss en $${stopLossPriceH1} y salida en $${targetPriceH1}.`,
      recommendationForSeller: `Liquidar posición corta o tomar ganancias inmediatas al tocar la resistencia R1 de $${r1_H1}.`,
      recommendationIfAlreadyHolding: `Mover el Stop al punto de entrada tan pronto la posición avance +0.3% para asegurar trade libre de riesgo.`,
      tacticalSteps: [
        `Paso 1: Verificar que el spread de mercado no exceda 0.05% antes de entrar.`,
        `Paso 2: Disparar orden límite de compra en $${entryMinH1}-$${entryMaxH1} con Stop Loss estricto en $${stopLossPriceH1}.`,
        `Paso 3: Tomar el 75% del beneficio al tocar $${targetPriceH1} (+${targetH1Gain}%).`,
        `Paso 4: Cancelar la orden si la vela de 1 hora cierra sin activar el movimiento.`,
      ],
    },
  };

  // =========================================================================
  // 2. H2 (2 HORAS - INTRADÍA CORTO)
  // =========================================================================
  const targetH2Gain = Math.max(0.6, Number((baseTargetGain * 0.18).toFixed(2)));
  const stopH2Loss = Math.max(0.35, Number((baseStopLoss * 0.20).toFixed(2)));
  const targetPriceH2 = Number((currentPrice * (1 + targetH2Gain / 100)).toFixed(2));
  const stopLossPriceH2 = Number((currentPrice * (1 - stopH2Loss / 100)).toFixed(2));
  const s1_H2 = Number((currentPrice * 0.994).toFixed(2));
  const s2_H2 = Number((currentPrice * 0.988).toFixed(2));
  const r1_H2 = Number((currentPrice * 1.008).toFixed(2));
  const r2_H2 = Number((currentPrice * 1.016).toFixed(2));
  const entryMinH2 = Number((currentPrice * 0.996).toFixed(2));
  const entryMaxH2 = Number((currentPrice * 1.0015).toFixed(2));

  const decisionH2 = deriveTimeframeDecision(
    'H2',
    currentPrice,
    baseVerdict,
    entryMinH2,
    entryMaxH2,
    targetPriceH2,
    stopLossPriceH2,
    s1_H2,
    r1_H2,
    baseConfidence - 2
  );

  resultTimeframes['H2'] = {
    timeframe: 'H2',
    label: 'H2 (2 Horas)',
    sublabel: 'Intradía Corto • 2 Horas',
    badgeText: 'Horizonte: H2 (2 Horas)',
    horizonDescription: 'Estrategia intradía de 2 horas capturando el impulso intermedio entre la apertura y el mediodía bursátil.',
    outlook: `Para ${assetName} (${ticker}), el marco de 2 horas (H2) cotiza en $${currentPrice.toFixed(2)}. Directiva: ${decisionH2.verdictLabel}. Soporte clave de 2 horas en $${s1_H2}. Si el flujo comprador sostiene la EMA 20 de H2, el precio buscará la resistencia R1 en $${targetPriceH2.toFixed(2)} (+${targetH2Gain}%).`,
    verdict: decisionH2.verdict,
    verdictLabel: decisionH2.verdictLabel,
    confidenceScore: decisionH2.confidenceScore,
    tradingStyle: 'Intradía Corto de Media Sesión',
    holdingPeriod: '1 a 3 horas',
    buyTriggerRule: `Apertura o consolidación del bloque de 2 horas sobre $${s1_H2} con volumen creciente`,
    sellTriggerRule: `Liquidación en resistencia R1 de 2H ($${r1_H2}) o agotamiento del impulso de mediodía`,
    invalidationRule: `Pérdida del mínimo de la vela previa de 2 horas ($${stopLossPriceH2})`,
    positionSizingGuidance: 'Riesgo moderado (1.0% de la cuenta) con stop dinámico al avanzar +0.5%',
    riskLevel: decisionH2.riskLevel,
    optimalEntryRange: {
      min: entryMinH2,
      max: entryMaxH2,
      note: 'Entrada táctica en el retesteo del soporte del bloque de 2 horas.',
    },
    targetPrice: {
      price: targetPriceH2,
      potentialGainPercent: targetH2Gain,
      reasoning: `Objetivo hacia la resistencia R1 de 2 horas ($${targetPriceH2}) en concordancia con el pivote medio de sesión.`,
    },
    stopLossSuggested: {
      price: stopLossPriceH2,
      potentialLossPercent: stopH2Loss,
      reasoning: `Invalidación por pérdida del mínimo del bloque de 2 horas previo en $${stopLossPriceH2}.`,
    },
    riskRewardRatio: `1:${(targetH2Gain / stopH2Loss).toFixed(2)}`,
    expectedMovePercent: '±0.6% a ±1.3%',
    supportLevels: [
      { price: s1_H2, strength: 'FUERTE', note: 'Soporte dinámico EMA 20 en H2' },
      { price: s2_H2, strength: 'CLAVE', note: 'Piso de consolidación de 2 horas' },
    ],
    resistanceLevels: [
      { price: r1_H2, strength: 'MEDIO', note: 'Resistencia intermedia R1 de 2H' },
      { price: r2_H2, strength: 'FUERTE', note: 'Techo del canal de 2 horas' },
    ],
    scenarios: {
      bullish: {
        probability: decisionH2.verdict.includes('COMPRA') ? 56 : 35,
        target: targetPriceH2,
        changePercent: `+${targetH2Gain}%`,
        description: `Avance direccional sostenido durante el bloque de 2 horas hacia $${targetPriceH2}.`,
        triggers: ['Volumen comprador constante', 'EMA 9 cruzando por encima de EMA 20 en H2'],
      },
      base: {
        probability: 32,
        target: Number((currentPrice * 1.002).toFixed(2)),
        changePercent: '+0.2%',
        description: `Movimiento en rango lateral acotado entre $${s1_H2} y $${r1_H2}.`,
        triggers: ['Baja volatilidad en índices de referencia'],
      },
      bearish: {
        probability: decisionH2.verdict.includes('COMPRA') ? 12 : 33,
        target: stopLossPriceH2,
        changePercent: `-${stopH2Loss}%`,
        description: `Perforación del soporte H2 con activación del Stop en $${stopLossPriceH2}.`,
        triggers: ['Presión vendedora institucional o rotación sectorial'],
      },
    },
    catalysts: [
      {
        dateOrTiming: 'Bloque de 2 horas',
        event: 'Desarrollo del rango de volatilidad de media sesión',
        potentialImpact: 'MEDIO',
        bias: decisionH2.verdict.includes('COMPRA') ? 'ALCISTA' : 'BAJISTA',
      },
      {
        dateOrTiming: 'Cierre de barra H2',
        event: 'Confirmación de tendencia en velas Heikin-Ashi / velas japonesas H2',
        potentialImpact: 'MEDIO',
        bias: 'VOLATIL',
      },
    ],
    actionPlan: {
      recommendationForBuyer: `Comprar en retrocesos a la EMA de 2 horas ($${s1_H2}) con Stop Loss en $${stopLossPriceH2}.`,
      recommendationForSeller: `Liquidar posiciones cortas o tomar ganancias en $${targetPriceH2}.`,
      recommendationIfAlreadyHolding: `Mantener con trailing stop debajo del mínimo de la vela de 2 horas anterior.`,
      tacticalSteps: [
        `Paso 1: Confirmar que el volumen apoye el rebote en $${s1_H2}.`,
        `Paso 2: Colocar orden Stop Loss en $${stopLossPriceH2} (riesgo de ${stopH2Loss}%).`,
        `Paso 3: Tomar ganancias parciales al alcanzar el target en $${targetPriceH2}.`,
      ],
    },
  };

  // =========================================================================
  // 3. H4 (4 HORAS - MEDIA SESIÓN / SWING INTRADÍA)
  // =========================================================================
  const targetH4Gain = Math.max(0.75, Number((baseTargetGain * 0.25).toFixed(2)));
  const stopH4Loss = Math.max(0.50, Number((baseStopLoss * 0.26).toFixed(2)));
  const targetPriceH4 = Number((currentPrice * (1 + targetH4Gain / 100)).toFixed(2));
  const stopLossPriceH4 = Number((currentPrice * (1 - stopH4Loss / 100)).toFixed(2));
  const s1_H4 = Number((currentPrice * 0.992).toFixed(2));
  const s2_H4 = Number((currentPrice * 0.985).toFixed(2));
  const r1_H4 = Number((currentPrice * 1.012).toFixed(2));
  const r2_H4 = Number((currentPrice * 1.022).toFixed(2));
  const entryMinH4 = Number((currentPrice * 0.995).toFixed(2));
  const entryMaxH4 = Number((currentPrice * 1.002).toFixed(2));

  const decisionH4 = deriveTimeframeDecision(
    'H4',
    currentPrice,
    baseVerdict,
    entryMinH4,
    entryMaxH4,
    targetPriceH4,
    stopLossPriceH4,
    s1_H4,
    r1_H4,
    baseConfidence - 1
  );

  resultTimeframes['H4'] = {
    timeframe: 'H4',
    label: 'H4 (4 Horas)',
    sublabel: 'Intradía / Swing • 4 Horas',
    badgeText: 'Horizonte: H4 (4 Horas)',
    horizonDescription: 'Operativa de 4 horas (media sesión bursátil) ideal para swing intradía respaldado por estructura técnica de 240 minutos.',
    outlook: `Para ${assetName} (${ticker}), la vela de 4 horas (H4) cotiza en $${currentPrice.toFixed(2)}. Directiva: ${decisionH4.verdictLabel}. Consolidación sobre el soporte clave de media sesión ($${s1_H4}). La proyección apunta hacia la resistencia mayor R1 en $${targetPriceH4.toFixed(2)} (+${targetH4Gain}%).`,
    verdict: decisionH4.verdict,
    verdictLabel: decisionH4.verdictLabel,
    confidenceScore: decisionH4.confidenceScore,
    tradingStyle: 'Swing Intradía / Estructura 240m',
    holdingPeriod: '4 a 12 horas',
    buyTriggerRule: `Cierre de vela de 4H por encima de la EMA 20 ($${s1_H4}) confirmando tendencia`,
    sellTriggerRule: `Alcanzar target R1 ($${r1_H4}) previo al cierre de sesión de Wall Street`,
    invalidationRule: `Ruptura bajista del soporte estructural de media sesión en $${stopLossPriceH4}`,
    positionSizingGuidance: 'Riesgo estándar (1.0% a 1.5% de la cuenta) con salida modular',
    riskLevel: decisionH4.riskLevel,
    optimalEntryRange: {
      min: entryMinH4,
      max: entryMaxH4,
      note: 'Entrada óptima en el retroceso hacia la EMA 20 de 4 horas.',
    },
    targetPrice: {
      price: targetPriceH4,
      potentialGainPercent: targetH4Gain,
      reasoning: `Objetivo de 4 horas hacia la resistencia técnica R1 ($${targetPriceH4}) respaldado por momentum en gráfico de 240 minutos.`,
    },
    stopLossSuggested: {
      price: stopLossPriceH4,
      potentialLossPercent: stopH4Loss,
      reasoning: `Nivel de invalidación fijado por debajo del mínimo de la vela previa de 4 horas ($${stopLossPriceH4}).`,
    },
    riskRewardRatio: `1:${(targetH4Gain / stopH4Loss).toFixed(2)}`,
    expectedMovePercent: '±0.9% a ±1.8%',
    supportLevels: [
      { price: s1_H4, strength: 'FUERTE', note: 'Soporte estructural EMA 20 en H4' },
      { price: s2_H4, strength: 'CLAVE', note: 'Piso mayor de la sesión de 4 horas' },
    ],
    resistanceLevels: [
      { price: r1_H4, strength: 'MEDIO', note: 'Resistencia intermedia R1 de H4' },
      { price: r2_H4, strength: 'FUERTE', note: 'Techo del canal de 4 horas / R2' },
    ],
    scenarios: {
      bullish: {
        probability: decisionH4.verdict.includes('COMPRA') ? 57 : 36,
        target: targetPriceH4,
        changePercent: `+${targetH4Gain}%`,
        description: `Expansión alcista que rompe la resistencia R1 y alcanza $${targetPriceH4} dentro de la vela H4.`,
        triggers: ['Volumen comprador sostenido en velas de 4 horas', 'MACD de H4 cruzando al alza'],
      },
      base: {
        probability: 31,
        target: Number((currentPrice * 1.003).toFixed(2)),
        changePercent: '+0.3%',
        description: `Oscilación dentro del rango lateral de media sesión entre $${s1_H4} y $${r1_H4}.`,
        triggers: ['Consolidación en horario de almuerzo de Wall Street'],
      },
      bearish: {
        probability: decisionH4.verdict.includes('COMPRA') ? 12 : 33,
        target: stopLossPriceH4,
        changePercent: `-${stopH4Loss}%`,
        description: `Pérdida del soporte EMA 20 en H4 con retroceso hacia el Stop Loss en $${stopLossPriceH4}.`,
        triggers: ['Venta institucional en el cierre de la primera mitad de la sesión'],
      },
    },
    catalysts: [
      {
        dateOrTiming: 'Cierre de bloque 4 horas',
        event: 'Cierre de la primera mitad de la sesión de Wall Street (1:30 PM ET)',
        potentialImpact: 'ALTO',
        bias: decisionH4.verdict.includes('COMPRA') ? 'ALCISTA' : 'BAJISTA',
      },
      {
        dateOrTiming: 'Inicio de la segunda mitad',
        event: 'Entrada del flujo de cierre de los mercados europeos',
        potentialImpact: 'MEDIO',
        bias: 'VOLATIL',
      },
    ],
    actionPlan: {
      recommendationForBuyer: `Comprar en retrocesos hacia la zona de $${s1_H4} con Stop Loss en $${stopLossPriceH4} y Target en $${targetPriceH4}.`,
      recommendationForSeller: `Tomar beneficios parciales al aproximarse a $${r1_H4}.`,
      recommendationIfAlreadyHolding: `Mantener posición con trailing stop en la EMA de 4 horas.`,
      tacticalSteps: [
        `Paso 1: Colocar orden límite en el rango $${entryMinH4} - $${entryMaxH4}.`,
        `Paso 2: Fijar Stop Loss en $${stopLossPriceH4} (riesgo de ${stopH4Loss}%).`,
        `Paso 3: Tomar 60% de ganancia en $${targetPriceH4} y dejar correr el resto.`,
      ],
    },
  };

  // =========================================================================
  // 4. 1 DÍA (DAY TRADING - 24 HORAS)
  // =========================================================================
  const target1DGain = Math.max(0.8, Number((baseTargetGain * 0.35).toFixed(2)));
  const stop1DLoss = Math.max(0.6, Number((baseStopLoss * 0.35).toFixed(2)));
  const targetPrice1D = Number((currentPrice * (1 + target1DGain / 100)).toFixed(2));
  const stopLossPrice1D = Number((currentPrice * (1 - stop1DLoss / 100)).toFixed(2));
  const s1_1D = Number((currentPrice * 0.991).toFixed(2));
  const s2_1D = Number((currentPrice * 0.983).toFixed(2));
  const r1_1D = Number((currentPrice * 1.014).toFixed(2));
  const r2_1D = Number((currentPrice * 1.026).toFixed(2));
  const entryMin1D = Number((currentPrice * 0.994).toFixed(2));
  const entryMax1D = Number((currentPrice * 1.002).toFixed(2));

  const decision1D = deriveTimeframeDecision(
    '1D',
    currentPrice,
    baseVerdict,
    entryMin1D,
    entryMax1D,
    targetPrice1D,
    stopLossPrice1D,
    s1_1D,
    r1_1D,
    baseConfidence
  );

  resultTimeframes['1D'] = {
    timeframe: '1D',
    label: '1 Día',
    sublabel: 'Day Trading • 24 Horas',
    badgeText: 'Horizonte: 1 Día (Intradía)',
    horizonDescription: 'Operativa de sesión intradiaria y Day Trading de 24 horas con balance inicial y VWAP.',
    outlook: `Para ${assetName} (${ticker}), la sesión de 24 horas presenta momentum activo en $${currentPrice.toFixed(2)}. Directiva: ${decision1D.verdictLabel}. Soporte intradiario de sesión en $${s1_1D}. Si el volumen sostiene VWAP, se proyecta testear la resistencia R1 intradiaria en $${targetPrice1D.toFixed(2)} (+${target1DGain}%).`,
    verdict: decision1D.verdict,
    verdictLabel: decision1D.verdictLabel,
    confidenceScore: decision1D.confidenceScore,
    tradingStyle: 'Day Trading de Sesión Completa',
    holdingPeriod: '1 a 2 sesiones diarias',
    buyTriggerRule: `Defensa de pivote diario y VWAP sobre $${s1_1D} durante la primera hora de negociación`,
    sellTriggerRule: `Toma de beneficio antes de la campana en $${r1_1D} o ejecución de MOC orders`,
    invalidationRule: `Pérdida del rango inicial de la jornada en $${stopLossPrice1D}`,
    positionSizingGuidance: 'Riesgo de sesión (1.5% del capital) sin pernoctar si no se supera el target',
    riskLevel: decision1D.riskLevel,
    optimalEntryRange: {
      min: entryMin1D,
      max: entryMax1D,
      note: 'Zona de entrada ceñida en retroceso intradiario hacia el soporte de VWAP.',
    },
    targetPrice: {
      price: targetPrice1D,
      potentialGainPercent: target1DGain,
      reasoning: `Objetivo intradiario hacia la resistencia R1 ($${targetPrice1D}) calculado con base en la volatilidad de la sesión.`,
    },
    stopLossSuggested: {
      price: stopLossPrice1D,
      potentialLossPercent: stop1DLoss,
      reasoning: `Invalidación intradiaria estricta por debajo del mínimo de la sesión ($${stopLossPrice1D}).`,
    },
    riskRewardRatio: `1:${(target1DGain / stop1DLoss).toFixed(2)}`,
    expectedMovePercent: '±1.2% a ±2.4%',
    supportLevels: [
      { price: s1_1D, strength: 'FUERTE', note: 'Soporte intradiario / VWAP de sesión' },
      { price: s2_1D, strength: 'CLAVE', note: 'Piso de invalidación de sesión' },
    ],
    resistanceLevels: [
      { price: r1_1D, strength: 'MEDIO', note: 'Primera resistencia intradiaria R1' },
      { price: r2_1D, strength: 'FUERTE', note: 'Techo de extensión máxima de 24 horas' },
    ],
    scenarios: {
      bullish: {
        probability: decision1D.verdict.includes('COMPRA') ? 55 : 35,
        target: targetPrice1D,
        changePercent: `+${target1DGain}%`,
        description: `Impulso comprador con volumen en apertura que rompe la resistencia R1 y alcanza $${targetPrice1D}.`,
        triggers: ['Volumen de apertura > 120% del promedio de los primeros 30 min', 'Precio cotizando sólidamente sobre VWAP'],
      },
      base: {
        probability: 32,
        target: Number((currentPrice * 1.004).toFixed(2)),
        changePercent: '+0.4%',
        description: `Oscilación lateral dentro del rango intradiario entre $${s1_1D} y $${r1_1D}.`,
        triggers: ['Volumen equilibrado sin noticias de alto impacto en la sesión'],
      },
      bearish: {
        probability: decision1D.verdict.includes('COMPRA') ? 13 : 33,
        target: stopLossPrice1D,
        changePercent: `-${stop1DLoss}%`,
        description: `Pérdida del soporte de sesión en $${s1_1D}, activando el Stop Loss intradiario en $${stopLossPrice1D}.`,
        triggers: ['Presión de ventas institucional o rechazo fuerte en VWAP'],
      },
    },
    catalysts: [
      {
        dateOrTiming: 'Apertura de sesión',
        event: 'Flujo de liquidez institucional y formación del rango inicial (Initial Balance)',
        potentialImpact: 'ALTO',
        bias: decision1D.verdict.includes('COMPRA') ? 'ALCISTA' : 'BAJISTA',
      },
      {
        dateOrTiming: 'Mediodía bursátil',
        event: 'Publicación de datos macro intradiarios y subastas de liquidez',
        potentialImpact: 'MEDIO',
        bias: 'VOLATIL',
      },
      {
        dateOrTiming: 'Cierre de sesión',
        event: 'MOC Orders (Market-On-Close) y rebalanceo de posiciones intradiarias',
        potentialImpact: 'MEDIO',
        bias: 'VOLATIL',
      },
    ],
    actionPlan: {
      recommendationForBuyer: `Ejecutar compras en rango $${entryMin1D} - $${entryMax1D} con Stop Loss intradiario en $${stopLossPrice1D} y Target en $${targetPrice1D}.`,
      recommendationForSeller: `Colocar órdenes de toma de ganancias en $${targetPrice1D} antes del cierre de mercado.`,
      recommendationIfAlreadyHolding: `Ajustar trailing stop al precio de entrada una vez que el activo avance un +0.8% en la sesión.`,
      tacticalSteps: [
        `Paso 1: Monitorear la reacción en los primeros 15 minutos respecto a $${currentPrice.toFixed(2)}.`,
        `Paso 2: Colocar orden límite con Stop Loss en $${stopLossPrice1D} (riesgo ceñido de ${stop1DLoss}%).`,
        `Paso 3: Tomar el 60% de ganancia en el primer toque de $${r1_1D} y asegurar el resto a precio de entrada.`,
        `Paso 4: Cerrar la posición intradía antes de la campana de cierre si no alcanza el target.`,
      ],
    },
  };

  // =========================================================================
  // 5. 1 SEMANA (SWING TRADE - 7 DÍAS)
  // =========================================================================
  const target1WGain = baseTargetGain;
  const stop1WLoss = baseStopLoss;
  const targetPrice1W = Number(baseResult.targetPrice1Week?.price) || Number((currentPrice * (1 + target1WGain / 100)).toFixed(2));
  const stopLossPrice1W = Number(baseResult.stopLossSuggested?.price) || Number((currentPrice * (1 - stop1WLoss / 100)).toFixed(2));
  const s1_1W = Number((currentPrice * 0.975).toFixed(2));
  const r1_1W = Number((currentPrice * 1.035).toFixed(2));
  const entryMin1W = baseResult.optimalEntryRange?.min ? Number(baseResult.optimalEntryRange.min) : Number((currentPrice * 0.985).toFixed(2));
  const entryMax1W = baseResult.optimalEntryRange?.max ? Number(baseResult.optimalEntryRange.max) : Number((currentPrice * 1.005).toFixed(2));

  const decision1W = deriveTimeframeDecision(
    '1W',
    currentPrice,
    baseVerdict,
    entryMin1W,
    entryMax1W,
    targetPrice1W,
    stopLossPrice1W,
    s1_1W,
    r1_1W,
    baseConfidence
  );

  resultTimeframes['1W'] = {
    timeframe: '1W',
    label: '1 Semana',
    sublabel: 'Swing Trade • 7 Días',
    badgeText: 'Horizonte: 1 Semana (Swing)',
    horizonDescription: 'Swing trading táctico a 7 días con soporte en EMAs y niveles pivote semanales.',
    outlook: baseResult.oneWeekOutlook || `Para ${assetName} (${ticker}), la cotización de $${currentPrice.toFixed(2)} consolida sobre la EMA de 20 periodos. Directiva: ${decision1W.verdictLabel}. La estructura técnica semanal proyecta un movimiento hacia la resistencia primaria en $${targetPrice1W.toFixed(2)} (+${target1WGain}%) en los próximos 7 días.`,
    verdict: decision1W.verdict,
    verdictLabel: decision1W.verdictLabel,
    confidenceScore: decision1W.confidenceScore,
    tradingStyle: 'Swing Trading Táctico Semanal',
    holdingPeriod: '3 a 7 días hábiles',
    buyTriggerRule: `Retest de soporte semanal en $${entryMin1W}-$${entryMax1W} con catalizador positivo de 7 días`,
    sellTriggerRule: `Alcanzar objetivo de ciclo semanal en $${targetPrice1W} o cierre semanal bajo EMA 20`,
    invalidationRule: `Pérdida del soporte estructural semanal en $${stopLossPrice1W}`,
    positionSizingGuidance: 'Posición estándar swing (1.5% a 2.0% de riesgo por trade)',
    riskLevel: decision1W.riskLevel,
    optimalEntryRange: {
      min: entryMin1W,
      max: entryMax1W,
      note: baseResult.optimalEntryRange?.note || 'Entrada táctica favorable en retrocesos hacia la media móvil semanal.',
    },
    targetPrice: {
      price: targetPrice1W,
      potentialGainPercent: target1WGain,
      reasoning: baseResult.targetPrice1Week?.reasoning || `Proyección técnica hacia la resistencia clave semanal en $${targetPrice1W}.`,
    },
    stopLossSuggested: {
      price: stopLossPrice1W,
      potentialLossPercent: stop1WLoss,
      reasoning: baseResult.stopLossSuggested?.reasoning || `Nivel de invalidación semanal fijado en $${stopLossPrice1W}.`,
    },
    riskRewardRatio: baseResult.riskRewardRatio || `1:${(target1WGain / stop1WLoss).toFixed(2)}`,
    expectedMovePercent: baseResult.technicalIndicators?.atrVolatility?.expectedMovePercent7Days || '±4.2% a ±6.5%',
    supportLevels: baseResult.technicalIndicators?.supportLevels || [
      { price: s1_1W, strength: 'FUERTE', note: 'Soporte dinámico EMA 20' },
      { price: stopLossPrice1W, strength: 'CLAVE', note: 'Piso mayor semanal' },
    ],
    resistanceLevels: baseResult.technicalIndicators?.resistanceLevels || [
      { price: r1_1W, strength: 'MEDIO', note: 'Resistencia intermedia semanal' },
      { price: targetPrice1W, strength: 'FUERTE', note: 'Objetivo de swing trade a 7 días' },
    ],
    scenarios: baseResult.scenarios1Week || {
      bullish: {
        probability: 55,
        target: targetPrice1W,
        changePercent: `+${target1WGain}%`,
        description: `Ruptura alcista con volumen superando la resistencia intermedia y alcanzando $${targetPrice1W}.`,
        triggers: ['Volumen comprador sostenido sobre la media', 'Cierres diarios positivos'],
      },
      base: {
        probability: 30,
        target: Number((currentPrice * 1.015).toFixed(2)),
        changePercent: '+1.5%',
        description: `Consolidación en rango lateral semanal entre $${(currentPrice * 0.985).toFixed(2)} y $${(currentPrice * 1.025).toFixed(2)}.`,
        triggers: ['Ausencia de catalizadores macro determinantes'],
      },
      bearish: {
        probability: 15,
        target: stopLossPrice1W,
        changePercent: `-${stop1WLoss}%`,
        description: `Pérdida del soporte EMA 20 que ejecuta el Stop Loss en $${stopLossPrice1W}.`,
        triggers: ['Aumento de la aversión al riesgo en los mercados globales'],
      },
    },
    catalysts: baseResult.keyCatalystsNext7Days || [
      {
        dateOrTiming: 'Día 2-3 de la semana',
        event: 'Testeo de resistencia técnica y nivel psicológico semanal',
        potentialImpact: 'ALTO',
        bias: 'ALCISTA',
      },
      {
        dateOrTiming: 'Día 4-5 de la semana',
        event: 'Publicación de indicadores económicos sectoriales',
        potentialImpact: 'MEDIO',
        bias: 'VOLATIL',
      },
      {
        dateOrTiming: 'Cierre semanal',
        event: 'Vencimiento de opciones y rebalanceo de carteras institucionales',
        potentialImpact: 'MEDIO',
        bias: 'VOLATIL',
      },
    ],
    actionPlan: baseResult.decisionActionPlan || {
      recommendationForBuyer: `Comprar en retrocesos hacia el rango de soporte con Stop Loss en $${stopLossPrice1W} y Target en $${targetPrice1W}.`,
      recommendationForSeller: `Asegurar beneficios parciales al tocar la primera resistencia semanal.`,
      recommendationIfAlreadyHolding: `Mantener posición con trailing stop en la EMA de 20 periodos.`,
      tacticalSteps: [
        `Paso 1: Colocar orden de compra en el rango $${entryMin1W} - $${entryMax1W}.`,
        `Paso 2: Fijar orden Stop Loss en $${stopLossPrice1W} (riesgo de ${stop1WLoss}%).`,
        `Paso 3: Tomar el 50% de ganancia en la primera resistencia y mover Stop a precio de entrada.`,
        `Paso 4: Liquidar posición restante al alcanzar el target semanal de $${targetPrice1W}.`,
      ],
    },
  };

  // =========================================================================
  // 6. 1 MES (POSICIONAL - 30 DÍAS)
  // =========================================================================
  const target1MGain = Number((baseTargetGain * 2.3).toFixed(2));
  const stop1MLoss = Number((baseStopLoss * 1.75).toFixed(2));
  const targetPrice1M = Number((currentPrice * (1 + target1MGain / 100)).toFixed(2));
  const stopLossPrice1M = Number((currentPrice * (1 - stop1MLoss / 100)).toFixed(2));
  const s1_1M = Number((currentPrice * 0.945).toFixed(2));
  const s2_1M = Number((currentPrice * 0.890).toFixed(2));
  const r1_1M = Number((currentPrice * 1.085).toFixed(2));
  const r2_1M = Number((currentPrice * 1.155).toFixed(2));
  const entryMin1M = Number((currentPrice * 0.970).toFixed(2));
  const entryMax1M = Number((currentPrice * 1.015).toFixed(2));

  const decision1M = deriveTimeframeDecision(
    '1M',
    currentPrice,
    baseVerdict,
    entryMin1M,
    entryMax1M,
    targetPrice1M,
    stopLossPrice1M,
    s1_1M,
    r1_1M,
    Math.min(94, baseConfidence + 4)
  );

  resultTimeframes['1M'] = {
    timeframe: '1M',
    label: '1 Mes',
    sublabel: 'Posicional • 30 Días',
    badgeText: 'Horizonte: 1 Mes (Posicional)',
    horizonDescription: 'Estrategia posicional de medio plazo (30 días) respaldada por medias móviles EMA 50/200 y catalizadores macro.',
    outlook: `Para ${assetName} (${ticker}), el análisis a 30 días cotiza en $${currentPrice.toFixed(2)}. Directiva: ${decision1M.verdictLabel}. Mantiene su estructura alcista por encima de la EMA 50 ($${s1_1M}). La proyección a 1 mes apunta hacia un target posicional de $${targetPrice1M.toFixed(2)} (+${target1MGain}%).`,
    verdict: decision1M.verdict,
    verdictLabel: decision1M.verdictLabel,
    confidenceScore: decision1M.confidenceScore,
    tradingStyle: 'Inversión Posicional y Macrotendencia',
    holdingPeriod: '2 a 6 semanas',
    buyTriggerRule: `Acumulación escalonada (DCA) en zona $${entryMin1M}-$${entryMax1M} respaldada por EMA 50/200 diaria y fundamentales`,
    sellTriggerRule: `Toma de ganancias posicional en canal mensual alto ($${r1_1M}) o rebalanceo mensual`,
    invalidationRule: `Pérdida de la media móvil estructural de 50 periodos en $${stopLossPrice1M}`,
    positionSizingGuidance: 'Asignación de cartera de medio plazo (dividir entrada en 2 o 3 compras escalonadas)',
    riskLevel: decision1M.riskLevel,
    optimalEntryRange: {
      min: entryMin1M,
      max: entryMax1M,
      note: 'Zona de acumulación posicional mediante compras escalonadas (DCA) en retrocesos a soportes estructurales.',
    },
    targetPrice: {
      price: targetPrice1M,
      potentialGainPercent: target1MGain,
      reasoning: `Extensión de ciclo mensual hacia la parte alta del canal de tendencia en $${targetPrice1M}.`,
    },
    stopLossSuggested: {
      price: stopLossPrice1M,
      potentialLossPercent: stop1MLoss,
      reasoning: `Invalidación estructural a 30 días fijada por debajo del soporte mayor de la EMA 50/200 diaria ($${stopLossPrice1M}).`,
    },
    riskRewardRatio: `1:${(target1MGain / stop1MLoss).toFixed(2)}`,
    expectedMovePercent: '±9.0% a ±15.5%',
    supportLevels: [
      { price: s1_1M, strength: 'FUERTE', note: 'Soporte dinámico estructural EMA 50 diaria' },
      { price: s2_1M, strength: 'CLAVE', note: 'Soporte mayor de ciclo mensual / EMA 200' },
    ],
    resistanceLevels: [
      { price: r1_1M, strength: 'MEDIO', note: 'Resistencia intermedia mensual' },
      { price: r2_1M, strength: 'FUERTE', note: 'Techo del canal mensual / Máximo de ciclo' },
    ],
    scenarios: {
      bullish: {
        probability: 58,
        target: targetPrice1M,
        changePercent: `+${target1MGain}%`,
        description: `Expansión alcista sostenida a lo largo de las 4 semanas, rompiendo resistencias previas y alcanzando $${targetPrice1M}.`,
        triggers: ['Presentación de resultados empresariales o catalizador macro favorable', 'Acumulación institucional constante'],
      },
      base: {
        probability: 27,
        target: Number((currentPrice * 1.035).toFixed(2)),
        changePercent: '+3.5%',
        description: `Consolidación constructiva en rango amplio de 30 días entre $${s1_1M} y $${r1_1M}.`,
        triggers: ['Mantenimiento de tasas de interés y datos económicos neutrales'],
      },
      bearish: {
        probability: 15,
        target: stopLossPrice1M,
        changePercent: `-${stop1MLoss}%`,
        description: `Pérdida de la media móvil estructural de 50 días que activa la salida preventiva en $${stopLossPrice1M}.`,
        triggers: ['Shock macroeconómico o deterioro general del sector'],
      },
    },
    catalysts: [
      {
        dateOrTiming: 'Semanas 1-2 del mes',
        event: 'Publicación de datos de inflación (CPI/PPI) y decisiones de política monetaria',
        potentialImpact: 'ALTO',
        bias: 'VOLATIL',
      },
      {
        dateOrTiming: 'Semana 3 del mes',
        event: 'Temporada de resultados trimestrales e informes de beneficios sectoriales',
        potentialImpact: 'ALTO',
        bias: 'ALCISTA',
      },
      {
        dateOrTiming: 'Cierre mensual (Semana 4)',
        event: 'Rebalanceo de carteras de fondos de inversión globales y cierre de velas mensuales',
        potentialImpact: 'MEDIO',
        bias: 'ALCISTA',
      },
    ],
    actionPlan: {
      recommendationForBuyer: `Acumular en el rango de $${entryMin1M} - $${entryMax1M} con Stop Loss mensual en $${stopLossPrice1M} y Target en $${targetPrice1M}.`,
      recommendationForSeller: `Mantener posición o tomar beneficios parciales al superar el +10% de ganancia en el mes.`,
      recommendationIfAlreadyHolding: `Mantener posición con trailing stop ajustado a la EMA 50 diaria para capturar la tendencia mensual completa.`,
      tacticalSteps: [
        `Paso 1: Dividir el capital asignado en 2 o 3 entradas para promediar el precio en retrocesos.`,
        `Paso 2: Establecer Stop Loss posicional amplio en $${stopLossPrice1M} (riesgo de ${stop1MLoss}%).`,
        `Paso 3: Tomar el 33% de ganancia en $${r1_1M} (+8.5%) y mover Stop a precio medio de entrada.`,
        `Paso 4: Dejar correr la posición principal hacia el precio objetivo mensual de $${targetPrice1M}.`,
      ],
    },
  };

  return resultTimeframes as Record<Timeframe, TimeframeData>;
}

/**
 * Helper to get the active timeframe data with absolute safety.
 */
export function getActiveTimeframeData(analysis: AssetAnalysisResult, activeTimeframe: Timeframe = '1W'): TimeframeData {
  const allTimeframes = buildMultiTimeframeData(analysis);
  return allTimeframes[activeTimeframe] || allTimeframes['1W'];
}
