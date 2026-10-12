import React, { useState } from 'react';
import { Scale, Trophy, TrendingUp, AlertTriangle, Sparkles, RefreshCw, CheckCircle2, ArrowRight, Building2, Radio, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CompareAnalysisResult, VerdictType } from '../types';

interface CompareTabProps {
  onAnalyzeAsset: (asset: string) => void;
}

export const CompareTab: React.FC<CompareTabProps> = ({ onAnalyzeAsset }) => {
  const [asset1, setAsset1] = useState('NVDA');
  const [asset2, setAsset2] = useState('TSLA');
  const [asset3, setAsset3] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompareAnalysisResult | null>(null);

  const presets = [
    { label: 'Megacaps IA: NVDA vs MSFT vs GOOGL', a1: 'NVDA', a2: 'MSFT', a3: 'GOOGL' },
    { label: 'Consumo S&P 500: AAPL vs AMZN vs TSLA', a1: 'AAPL', a2: 'AMZN', a3: 'TSLA' },
    { label: 'Finanzas S&P 500: JPM vs V vs BRK.B', a1: 'JPM', a2: 'V', a3: 'BRK.B' },
    { label: 'Salud S&P 500: LLY vs UNH vs ABBV', a1: 'LLY', a2: 'UNH', a3: 'ABBV' },
    { label: 'US 500 vs US 100 vs NVDA', a1: 'US500', a2: 'US100', a3: 'NVDA' },
    { label: 'Energía S&P 500: XOM vs CVX', a1: 'XOM', a2: 'CVX', a3: '' },
    { label: 'Oro vs US 500 (S&P 500)', a1: 'ORO', a2: 'US500', a3: '' },
  ];

  const handleCompare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const assetsToCompare = [asset1.trim(), asset2.trim(), asset3.trim()].filter(Boolean);
    if (assetsToCompare.length < 2) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/compare-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assets: assetsToCompare }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error comparing assets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreset = (p: typeof presets[0]) => {
    setAsset1(p.a1);
    setAsset2(p.a2);
    setAsset3(p.a3);
  };

  const getVerdictBadge = (verdict: VerdictType) => {
    switch (verdict) {
      case 'COMPRA_FUERTE':
      case 'COMPRA':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MANTENER':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'VENTA':
      case 'VENTA_FUERTE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Scale className="w-6 h-6 text-emerald-600" />
              Comparador Multiactivo: Decisión Wall Street (7 Días)
            </h2>
            <p className="text-slate-600 text-sm mt-0.5">
              Compara 2 o 3 activos simultáneamente para descubrir cuál tiene la mejor asimetría y potencial alcista sincronizado con la Bolsa de Nueva York.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-emerald-400 text-xs font-bold self-start sm:self-auto border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Sincronizado con Precios NY</span>
          </div>
        </div>

        <form onSubmit={handleCompare} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Activo A (Principal):
              </label>
              <input
                type="text"
                value={asset1}
                onChange={(e) => setAsset1(e.target.value)}
                placeholder="Ej: NVDA"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Activo B (Comparativa):
              </label>
              <input
                type="text"
                value={asset2}
                onChange={(e) => setAsset2(e.target.value)}
                placeholder="Ej: TSLA"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Activo C (Opcional):
              </label>
              <input
                type="text"
                value={asset3}
                onChange={(e) => setAsset3(e.target.value)}
                placeholder="Ej: BTC (Opcional)"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-1">Duelos sugeridos:</span>
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => loadPreset(p)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg text-xs font-bold text-slate-700 transition-colors border border-slate-200"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              id="submit-compare-btn"
              type="submit"
              disabled={isLoading || !asset1 || !asset2}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sincronizando con Wall Street...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Determinar Ganador de la Semana</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Winner Showcase Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md border border-emerald-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-black">
                    <Trophy className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Elección Ganadora para esta Semana (7 Días) • Wall Street
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {result.winner?.asset}
                  </h3>
                  <span className="bg-emerald-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                    {result.winner?.verdict || 'COMPRA RECOMENDADA'}
                  </span>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed max-w-3xl font-medium pt-1">
                  {result.winner?.reason}
                </p>
              </div>

              <button
                onClick={() => onAnalyzeAsset(result.winner.asset)}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow flex items-center justify-center gap-2 self-start sm:self-center shrink-0 cursor-pointer"
              >
                <span>Analizar a Fondo {result.winner.asset}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ranking Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.ranking?.map((item, idx) => {
              const liveQ = (result as any).liveQuotes?.[item.asset] || (item as any).quote;
              const isPositive = liveQ ? liveQ.change >= 0 : true;

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-xl border p-5 space-y-3 transition-all ${
                    item.rank === 1
                      ? 'border-emerald-400 ring-2 ring-emerald-100 shadow-sm'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center ${
                        item.rank === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}>
                        #{item.rank}
                      </span>
                      <h4 className="text-lg font-black text-slate-900">{item.asset}</h4>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getVerdictBadge(item.verdict)}`}>
                      {item.verdict}
                    </span>
                  </div>

                  {liveQ && (
                    <div className="flex items-center justify-between bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs">
                      <span className="font-mono text-emerald-400 font-bold">
                        ${liveQ.price >= 1000 ? liveQ.price.toLocaleString('en-US') : liveQ.price.toFixed(2)} {liveQ.currency}
                      </span>
                      <span className={`text-[11px] font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{liveQ.changePercent?.toFixed(2)}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <span>Puntuación Táctica:</span>
                    <span className="font-extrabold text-slate-900">{item.score} / 100</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.summary}
                  </p>

                  {item.pros && (
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700 uppercase">Puntos a favor:</span>
                      {item.pros.map((pro, pIdx) => (
                        <div key={pIdx} className="text-xs text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => onAnalyzeAsset(item.asset)}
                    className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Ver ficha técnica</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comparative Table */}
          {result.comparisonTable && result.comparisonTable.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 overflow-x-auto">
              <h4 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                Matriz Comparativa Sincronizada con Wall Street
              </h4>
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-4">Métrica de Decisión</th>
                    {result.assets.map((a, i) => (
                      <th key={i} className="py-3 px-4 text-slate-900 font-black">{a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.comparisonTable.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-700">{row.metric}</td>
                      {result.assets.map((a, aIdx) => (
                        <td key={aIdx} className="py-3 px-4 font-semibold text-slate-900">
                          {String(row[a] || '---')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Synthesis */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
            <strong className="text-slate-900 font-bold">Conclusión Táctica: </strong>
            {result.synthesis}
          </div>
        </div>
      )}
    </div>
  );
};
