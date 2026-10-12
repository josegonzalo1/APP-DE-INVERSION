import React from 'react';
import { TrendingUp, BarChart3, Calculator, Scale, History, Sparkles, Clock } from 'lucide-react';

interface HeaderProps {
  activeTab: 'analyzer' | 'compare' | 'calculator' | 'history';
  onSelectTab: (tab: 'analyzer' | 'compare' | 'calculator' | 'history') => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, savedCount }) => {
  return (
    <header className="border-b border-slate-200 bg-slate-900 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('analyzer')}>
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-inner">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white uppercase">
                  EL INVERSOR
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> H1 a 1M • S&P 500 Completo
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Motor de Decisiones Financieras, Análisis Técnico & FODA con IA
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="nav-analyzer-btn"
              onClick={() => onSelectTab('analyzer')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'analyzer'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analizador</span>
            </button>

            <button
              id="nav-compare-btn"
              onClick={() => onSelectTab('compare')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'compare'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Comparador</span>
            </button>

            <button
              id="nav-calculator-btn"
              onClick={() => onSelectTab('calculator')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'calculator'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Calculadora Riesgo</span>
            </button>

            <button
              id="nav-history-btn"
              onClick={() => onSelectTab('history')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Historial</span>
              {savedCount > 0 && (
                <span className="bg-emerald-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
