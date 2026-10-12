import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NYMarketSyncBar } from './components/NYMarketSyncBar';
import { AssetSearchForm } from './components/AssetSearchForm';
import { VerdictBanner } from './components/VerdictBanner';
import { ProsAndConsSection } from './components/ProsAndConsSection';
import { SwotAnalysisSection } from './components/SwotAnalysisSection';
import { TechnicalIndicatorsSection } from './components/TechnicalIndicatorsSection';
import { ScenariosTable } from './components/ScenariosTable';
import { CatalystsAndGrounding } from './components/CatalystsAndGrounding';
import { RealtimeDecisionMatrix } from './components/RealtimeDecisionMatrix';
import { MultiTimeframeConfluenceSection } from './components/MultiTimeframeConfluenceSection';
import { QuantitativeAuditSection } from './components/QuantitativeAuditSection';
import { RiskCalculatorTab } from './components/RiskCalculatorTab';
import { CompareTab } from './components/CompareTab';
import { HistoryTab } from './components/HistoryTab';
import { AssetAnalysisResult, SavedAnalysis, Timeframe } from './types';
import { ShieldCheck, Sparkles, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { getActiveTimeframeData } from './utils/timeframeEngine';
import { useRealtimeMarketSync } from './hooks/useRealtimeMarketSync';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'compare' | 'calculator' | 'history'>('analyzer');
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1W');
  const [analysisData, setAnalysisData] = useState<AssetAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>(() => {
    try {
      const stored = localStorage.getItem('el_inversor_saved');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever savedAnalyses updates
  useEffect(() => {
    try {
      localStorage.setItem('el_inversor_saved', JSON.stringify(savedAnalyses));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [savedAnalyses]);

  // Initial load: trigger automatic analysis on NVDA so the dashboard is immediately interactive
  useEffect(() => {
    handleAnalyze('NVDA', 'Acción', 135.0, undefined, 'EVALUATE');
  }, []);

  // Real-time market quote polling and tick synchronization engine
  const {
    liveQuote,
    isSyncing: isMarketSyncing,
    isAutoSyncActive,
    setIsAutoSyncActive,
    activeInterval,
    setActiveInterval,
    lastSyncTime,
    tickDirection,
    refreshNow: refreshMarketQuoteNow,
  } = useRealtimeMarketSync({
    symbol: analysisData?.ticker || analysisData?.asset,
    initialQuote: analysisData?.marketQuote,
    enabled: true,
    intervalSeconds: 15,
    onQuoteUpdate: (freshQuote) => {
      setAnalysisData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentEstimatedPrice: freshQuote.price,
          marketQuote: freshQuote,
        };
      });
    },
  });

  const handleAnalyze = async (
    asset: string,
    assetType?: string,
    currentPrice?: number,
    additionalContext?: string,
    userIntent?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset,
          assetType,
          currentPrice,
          additionalContext,
          userIntent,
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo procesar el análisis. Inténtalo de nuevo.');
      }

      const data: AssetAnalysisResult = await response.json();
      setAnalysisData(data);
      setActiveTab('analyzer');
    } catch (error: any) {
      console.error('Analysis error:', error);
      setErrorMessage(error.message || 'Ocurrió un error al contactar al motor de decisiones.');
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentSaved = Boolean(
    analysisData && savedAnalyses.some((s) => s.id === analysisData.id || (s.asset === analysisData.asset && s.ticker === analysisData.ticker))
  );

  const handleToggleSave = () => {
    if (!analysisData) return;
    if (isCurrentSaved) {
      setSavedAnalyses((prev) => prev.filter((s) => s.asset !== analysisData.asset));
    } else {
      const currentTfData = getActiveTimeframeData(analysisData, activeTimeframe);
      const newItem: SavedAnalysis = {
        id: analysisData.id || `save_${Date.now()}`,
        asset: `${analysisData.asset} (${activeTimeframe})`,
        ticker: analysisData.ticker,
        date: new Date().toISOString(),
        verdict: currentTfData.verdict || analysisData.verdict,
        confidence: currentTfData.confidenceScore || analysisData.confidenceScore,
        targetPrice: `${currentTfData.targetPrice?.price || analysisData.targetPrice1Week?.price} ${analysisData.currency || 'USD'}`,
        stopLoss: `${currentTfData.stopLossSuggested?.price || analysisData.stopLossSuggested?.price} ${analysisData.currency || 'USD'}`,
        result: analysisData,
      };
      setSavedAnalyses((prev) => [newItem, ...prev]);
    }
  };

  const handleSelectFromHistory = (saved: SavedAnalysis) => {
    if (saved.result) {
      setAnalysisData(saved.result);
      setActiveTab('analyzer');
    }
  };

  const handleDeleteSaved = (id: string) => {
    setSavedAnalyses((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAllHistory = () => {
    if (window.confirm('¿Seguro que deseas borrar todo el historial de análisis?')) {
      setSavedAnalyses([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header with Navigation & Live Market Horizon Indicator */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={savedAnalyses.length}
      />

      {/* Real-time New York Stock Exchange Market Synchronization Bar */}
      <NYMarketSyncBar
        onSelectAsset={(symbol) => handleAnalyze(symbol)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Notice if any */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Main Analyzer */}
        {activeTab === 'analyzer' && (
          <div>
            {/* Search and Asset Selection Form */}
            <AssetSearchForm onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Analysis Results Display */}
            {analysisData && (
              <div className="space-y-6">
                {/* 1. Main AI Verdict Banner & Confidence Gauge with Timeframe Dropdown */}
                <VerdictBanner
                  data={analysisData}
                  isSaved={isCurrentSaved}
                  onToggleSave={handleToggleSave}
                  onOpenRiskCalc={() => setActiveTab('calculator')}
                  timeframe={activeTimeframe}
                  onTimeframeChange={setActiveTimeframe}
                  tickDirection={tickDirection}
                  isSyncing={isMarketSyncing}
                  onRefreshNow={refreshMarketQuoteNow}
                />

                {/* 2. Real-Time Decision & Execution Matrix (Semáforo de Entrada, Metas en Vivo y Dimensionamiento) */}
                <RealtimeDecisionMatrix
                  analysis={analysisData}
                  timeframe={activeTimeframe}
                  liveQuote={liveQuote || analysisData.marketQuote}
                  isSyncing={isMarketSyncing}
                  tickDirection={tickDirection}
                  lastSyncTime={lastSyncTime}
                  isAutoSyncActive={isAutoSyncActive}
                  activeInterval={activeInterval}
                  onToggleAutoSync={() => setIsAutoSyncActive(!isAutoSyncActive)}
                  onRefreshNow={refreshMarketQuoteNow}
                  onChangeInterval={setActiveInterval}
                  onOpenFullCalculator={() => setActiveTab('calculator')}
                />

                {/* 3. Multi-Timeframe Confluence Section (H1, H2, H4, 1D, 1W, 1M) */}
                <MultiTimeframeConfluenceSection
                  analysis={analysisData}
                  activeTimeframe={activeTimeframe}
                  onSelectTimeframe={setActiveTimeframe}
                  currentLivePrice={liveQuote?.price || Number(analysisData.currentEstimatedPrice)}
                />

                {/* 4. Quantitative Audit & Reliability Model (Auditoría Matemática, 5 Pilares, Win Rate & Fórmulas) */}
                <QuantitativeAuditSection
                  analysis={analysisData}
                />

                {/* 5. Pros and Cons Section (Ventajas y Desventajas) */}
                <ProsAndConsSection
                  prosAndCons={analysisData.prosAndCons}
                  assetName={analysisData.asset}
                />

                {/* 3. Technical Indicators Dashboard Synchronized to Active Timeframe */}
                <TechnicalIndicatorsSection
                  indicators={analysisData.technicalIndicators}
                  currency={analysisData.currency}
                  currentPrice={analysisData.currentEstimatedPrice}
                  marketQuote={analysisData.marketQuote}
                  assetName={analysisData.asset}
                  timeframe={activeTimeframe}
                  fullAnalysis={analysisData}
                />

                {/* 4. SWOT / FODA Analysis Matrix */}
                <SwotAnalysisSection
                  swot={analysisData.swotAnalysis}
                  assetName={analysisData.asset}
                />

                {/* 5. Comparative Scenarios Table Synchronized to Active Timeframe */}
                <ScenariosTable
                  scenarios={analysisData.scenarios1Week}
                  assetName={analysisData.asset}
                  currency={analysisData.currency}
                  timeframe={activeTimeframe}
                  fullAnalysis={analysisData}
                />

                {/* 6. Catalysts, Tactical Action Plan & Real-time Web Sources Synchronized */}
                <CatalystsAndGrounding
                  catalysts={analysisData.keyCatalystsNext7Days}
                  actionPlan={analysisData.decisionActionPlan}
                  groundingSources={analysisData.groundingSources}
                  assetName={analysisData.asset}
                  timeframe={activeTimeframe}
                  fullAnalysis={analysisData}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Asset Comparator */}
        {activeTab === 'compare' && (
          <CompareTab onAnalyzeAsset={(asset) => handleAnalyze(asset)} />
        )}

        {/* Tab 3: Risk & Position Sizing Calculator */}
        {activeTab === 'calculator' && (
          <RiskCalculatorTab 
            currentAnalysis={analysisData} 
            timeframe={activeTimeframe}
            onTimeframeChange={setActiveTimeframe}
          />
        )}

        {/* Tab 4: History of Saved Analyses */}
        {activeTab === 'history' && (
          <HistoryTab
            savedList={savedAnalyses}
            onSelectAnalysis={handleSelectFromHistory}
            onDeleteAnalysis={handleDeleteSaved}
            onClearAll={handleClearAllHistory}
            onReanalyze={(symbol) => handleAnalyze(symbol)}
          />
        )}
      </main>

      {/* Institutional Financial Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">
              EL INVERSOR
            </span>
            <span>—</span>
            <span>Motor Cuantitativo & Asesor Táctico Multi-Marco (1D / 1W / 1M)</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span>Horizontes: 1 Día (Intradía) • 1 Semana (Swing) • 1 Mes (Posicional)</span>
            <span>•</span>
            <span>Grounding Financiero en Tiempo Real</span>
            <span>•</span>
            <span>FODA & Análisis Técnico Integrado</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
