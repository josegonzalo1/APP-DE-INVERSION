export type VerdictType = 'COMPRA_FUERTE' | 'COMPRA' | 'MANTENER' | 'VENTA' | 'VENTA_FUERTE';

export type RiskLevel = 'BAJO' | 'MODERADO' | 'ALTO' | 'MUY_ALTO';

export type IndicatorSignal = 'ALCISTA' | 'BAJISTA' | 'NEUTRAL' | 'SOBRECOMPRA' | 'SOBREVENTA' | 'MIXTA';

export type Timeframe = 'H1' | 'H2' | 'H4' | '1D' | '1W' | '1M';

export type RealtimeExecutionState = 
  | 'ACTIVE_BUY_ZONE' 
  | 'PULLBACK_WAIT' 
  | 'DISCOUNT_TEST' 
  | 'STOP_ALERT' 
  | 'TARGET_REACHED' 
  | 'HOLD_MONITOR';

export interface RealtimeDecisionInfo {
  state: RealtimeExecutionState;
  badgeLabel: string;
  badgeColor: string;
  badgeBgLight: string;
  actionDirective: string;
  distanceToTargetPct: number;
  distanceToStopLossPct: number;
  liveRiskRewardRatio: string;
  isInOptimalZone: boolean;
  urgency: 'INMEDIATA' | 'MODERADA' | 'ESPERAR_RETROCESO' | 'ALERTA_RIESGO';
  livePrice: number;
  targetPrice: number;
  stopLossPrice: number;
  entryMin: number;
  entryMax: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface TechnicalIndicators {
  rsi14: {
    value: number;
    status: 'SOBRECOMPRA' | 'NEUTRAL' | 'SOBREVENTA';
    interpretation: string;
  };
  macd: {
    status: 'CRUCE_ALCISTA' | 'CRUCE_BAJISTA' | 'NEUTRAL';
    interpretation: string;
  };
  movingAverages: {
    ema20: string | number;
    ema50: string | number;
    ema200: string | number;
    signal: 'ALCISTA' | 'BAJISTA' | 'MIXTA';
    note: string;
  };
  bollingerBands: {
    position: string;
    interpretation: string;
  };
  supportLevels: Array<{
    price: string | number;
    strength: 'FUERTE' | 'MEDIO' | 'CLAVE';
    note: string;
  }>;
  resistanceLevels: Array<{
    price: string | number;
    strength: 'FUERTE' | 'MEDIO' | 'CLAVE';
    note: string;
  }>;
  volumeTrend: string;
  stochastic?: {
    value: number;
    status: string;
  };
  atrVolatility: {
    description: string;
    expectedMovePercent7Days: string;
  };
}

export interface ProConItem {
  title: string;
  description: string;
  weight: 'ALTO' | 'MEDIO' | 'BAJO';
}

export interface ProsAndCons {
  pros: ProConItem[];
  cons: ProConItem[];
}

export interface SwotItem {
  title: string;
  detail: string;
}

export interface SwotAnalysis {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

export interface ScenarioDetail {
  probability: number;
  target: string | number;
  changePercent: string;
  description: string;
  triggers: string[];
}

export interface Scenarios1Week {
  bullish: ScenarioDetail;
  base: ScenarioDetail;
  bearish: ScenarioDetail;
}

export interface CatalystItem {
  dateOrTiming: string;
  event: string;
  potentialImpact: 'ALTO' | 'MEDIO' | 'BAJO';
  bias: 'ALCISTA' | 'BAJISTA' | 'VOLATIL';
}

export interface DecisionActionPlan {
  recommendationForBuyer: string;
  recommendationForSeller: string;
  recommendationIfAlreadyHolding: string;
  tacticalSteps: string[];
}

export interface TimeframeData {
  timeframe: Timeframe;
  label: string; // '1 Día' | '1 Semana' | '1 Mes'
  sublabel: string;
  badgeText: string;
  horizonDescription: string;
  outlook: string;
  verdict?: VerdictType;
  verdictLabel?: string;
  confidenceScore?: number;
  tradingStyle?: string;
  holdingPeriod?: string;
  buyTriggerRule?: string;
  sellTriggerRule?: string;
  invalidationRule?: string;
  positionSizingGuidance?: string;
  riskLevel?: 'BAJO' | 'MODERADO' | 'ALTO' | 'MUY_ALTO';
  optimalEntryRange: {
    min: number | string;
    max: number | string;
    note: string;
  };
  targetPrice: {
    price: number | string;
    potentialGainPercent: number | string;
    reasoning: string;
  };
  stopLossSuggested: {
    price: number | string;
    potentialLossPercent: number | string;
    reasoning: string;
  };
  riskRewardRatio: string;
  expectedMovePercent: string;
  supportLevels: Array<{
    price: string | number;
    strength: 'FUERTE' | 'MEDIO' | 'CLAVE';
    note: string;
  }>;
  resistanceLevels: Array<{
    price: string | number;
    strength: 'FUERTE' | 'MEDIO' | 'CLAVE';
    note: string;
  }>;
  scenarios: Scenarios1Week;
  catalysts: CatalystItem[];
  actionPlan: DecisionActionPlan;
}

export interface MarketQuoteInfo {
  ticker: string;
  name: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  isMarketOpen: boolean;
  marketStateText: string;
  sessionPhase?: 'REGULAR' | 'PRE_MARKET' | 'AFTER_HOURS' | 'WEEKEND' | 'CLOSED';
  priceSource: 'REALTIME' | 'FRIDAY_CLOSE' | 'AFTER_HOURS' | 'CRYPTO_24_7';
  asOfDate: string;
  asOfTime: string;
  lastCloseDate: string;
  lastCloseLabel?: string;
  previousClose: number;
  exchange?: string;
  high24h?: number;
  low24h?: number;
  volume?: string;
  note?: string;
  nextBellText?: string;
  timeUntilOpenOrClose?: string;
}

export interface LiveMarketQuote extends MarketQuoteInfo {}

export interface NYIndexItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
  exchange?: string;
  category?: 'INDEX' | 'STOCK' | 'COMMODITY' | 'CRYPTO';
}

export interface NYMarketOverview {
  nyTimeStr: string;
  nyDateStr: string;
  sessionPhase: 'REGULAR' | 'PRE_MARKET' | 'AFTER_HOURS' | 'WEEKEND' | 'CLOSED';
  sessionName: string;
  isOpen: boolean;
  statusBadgeColor: string;
  timeUntilOpenOrClose: string;
  nextBellText: string;
  marketLocation: string;
  indices: NYIndexItem[];
  topEquities: NYIndexItem[];
  lastSyncTimestamp: number;
}

export interface AssetAnalysisResult {
  id: string;
  timestamp: string;
  asset: string;
  ticker: string;
  assetType: string;
  currentEstimatedPrice: string | number;
  currency: string;
  marketQuote?: MarketQuoteInfo;
  verdict: VerdictType;
  verdictLabel: string;
  confidenceScore: number;
  selectedTimeframe?: Timeframe;
  timeframes?: Record<Timeframe, TimeframeData>;
  oneWeekOutlook: string;
  optimalEntryRange: {
    min: number | string;
    max: number | string;
    note: string;
  };
  targetPrice1Week: {
    price: number | string;
    potentialGainPercent: number | string;
    reasoning: string;
  };
  stopLossSuggested: {
    price: number | string;
    potentialLossPercent: number | string;
    reasoning: string;
  };
  riskRewardRatio: string;
  riskLevel: RiskLevel;
  technicalIndicators: TechnicalIndicators;
  prosAndCons: ProsAndCons;
  swotAnalysis: SwotAnalysis;
  scenarios1Week: Scenarios1Week;
  keyCatalystsNext7Days: CatalystItem[];
  decisionActionPlan: DecisionActionPlan;
  groundingSources?: GroundingSource[];
  quantitativeAudit?: QuantitativeAuditModel;
}

export interface QuantitativeAuditFactor {
  name: string;
  category: 'TREND' | 'MOMENTUM' | 'VOLATILITY' | 'VOLUME' | 'STRUCTURE';
  weight: number; // percentage out of 100
  score: number; // 0 to 100
  signal: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  formula: string;
  liveReading: string;
  rationale: string;
}

export interface HistoricalBacktestSummary {
  samplePeriod: string; // e.g. "Últimos 12 meses (52 semanas)"
  totalTradesTracked: number; // e.g. 48
  winRatePct: number; // e.g. 71.4%
  averageRiskReward: string; // e.g. "1:2.1"
  profitFactor: number; // e.g. 2.34
  maxDrawdownPct: number; // e.g. -4.8%
  methodology: string; // "Cálculo cuantitativo estricto Stop Loss / Take Profit con validación de precios de cierre semanales"
}

export interface QuantitativeAuditModel {
  auditStatus: 'VERIFIED' | 'CALIBRATED';
  reliabilityRating: 'A+' | 'A' | 'B+' | 'B';
  globalConfluenceScore: number; // 0 to 100
  mathematicalVerdict: VerdictType;
  factors: QuantitativeAuditFactor[];
  formulaBreakdown: {
    entryFormula: string;
    stopLossFormula: string;
    takeProfitFormula: string;
    riskRewardFormula: string;
  };
  backtest: HistoricalBacktestSummary;
  dataQualityAudit: {
    primaryFeed: string;
    verificationFeed: string;
    lastLatencyMs: number;
    quoteConsistency: 'ALTA' | 'PERFECTA';
    asOfTimestamp: string;
  };
}

export interface CompareAnalysisResult {
  timestamp: string;
  assets: string[];
  winner: {
    asset: string;
    reason: string;
    verdict: VerdictType;
  };
  ranking: Array<{
    asset: string;
    rank: number;
    verdict: VerdictType;
    score: number;
    summary: string;
    pros: string[];
    risk: string;
  }>;
  comparisonTable: Array<{
    metric: string;
    [key: string]: string | number;
  }>;
  synthesis: string;
  groundingSources?: GroundingSource[];
}

export interface SavedAnalysis {
  id: string;
  asset: string;
  ticker: string;
  date: string;
  verdict: VerdictType;
  confidence: number;
  targetPrice: string | number;
  stopLoss: string | number;
  result: AssetAnalysisResult;
}
