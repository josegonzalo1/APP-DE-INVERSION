import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  Zap, 
  Target, 
  SlidersHorizontal, 
  RefreshCw,
  Building2,
  ChevronDown,
  Layers,
  Star
} from 'lucide-react';
import { PRESET_ASSETS, PresetAsset } from '../data/presetAssets';
import { searchSP500Stocks, SP500Stock, SP500_STOCKS } from '../data/sp500';
import { SP500ExplorerModal } from './SP500ExplorerModal';

interface AssetSearchFormProps {
  onAnalyze: (asset: string, assetType?: string, currentPrice?: number, additionalContext?: string, userIntent?: string) => void;
  isLoading: boolean;
}

export const AssetSearchForm: React.FC<AssetSearchFormProps> = ({ onAnalyze, isLoading }) => {
  const [assetQuery, setAssetQuery] = useState('NVDA');
  const [assetType, setAssetType] = useState('Acción');
  const [userIntent, setUserIntent] = useState<'BUY' | 'SELL' | 'EVALUATE'>('EVALUATE');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('S&P 500 Megacaps');
  const [isSP500ModalOpen, setIsSP500ModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const categories = ['S&P 500 Megacaps', 'Todos', 'Acciones', 'Cripto', 'Materias Primas', 'Índices', 'Forex'];

  // S&P 500 Megacap presets
  const sp500Megacaps: PresetAsset[] = [
    { symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'Acciones', icon: 'Cpu', typicalPrice: '135.00 USD' },
    { symbol: 'AAPL', name: 'Apple Inc.', category: 'Acciones', icon: 'Smartphone', typicalPrice: '228.00 USD' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'Acciones', icon: 'Cloud', typicalPrice: '418.00 USD' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Acciones', icon: 'ShoppingBag', typicalPrice: '190.00 USD' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'Acciones', icon: 'Search', typicalPrice: '175.00 USD' },
    { symbol: 'META', name: 'Meta Platforms', category: 'Acciones', icon: 'Radio', typicalPrice: '640.00 USD' },
    { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Acciones', icon: 'Zap', typicalPrice: '215.00 USD' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway', category: 'Acciones', icon: 'Landmark', typicalPrice: '450.00 USD' },
    { symbol: 'LLY', name: 'Eli Lilly & Co.', category: 'Acciones', icon: 'HeartPulse', typicalPrice: '830.00 USD' },
    { symbol: 'JPM', name: 'JPMorgan Chase', category: 'Acciones', icon: 'Landmark', typicalPrice: '240.00 USD' },
    { symbol: 'V', name: 'Visa Inc.', category: 'Acciones', icon: 'CreditCard', typicalPrice: '315.00 USD' },
    { symbol: 'COST', name: 'Costco Wholesale', category: 'Acciones', icon: 'ShoppingBag', typicalPrice: '920.00 USD' },
  ];

  const getFilteredPresets = () => {
    if (activeCategory === 'S&P 500 Megacaps') {
      return sp500Megacaps;
    }
    if (activeCategory === 'Todos') {
      return PRESET_ASSETS;
    }
    return PRESET_ASSETS.filter((p) => p.category === activeCategory);
  };

  const filteredPresets = getFilteredPresets();

  // Instant S&P 500 autocomplete suggestions
  const suggestions: SP500Stock[] = React.useMemo(() => {
    if (!assetQuery || assetQuery.trim().length === 0) return [];
    return searchSP500Stocks(assetQuery, undefined, 8);
  }, [assetQuery]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetQuery.trim() || isLoading) return;
    setShowDropdown(false);
    onAnalyze(
      assetQuery.trim(),
      assetType,
      currentPrice ? parseFloat(currentPrice) : undefined,
      additionalContext.trim() || undefined,
      userIntent
    );
  };

  const handleSelectPreset = (preset: PresetAsset) => {
    setAssetQuery(preset.symbol);
    setAssetType(preset.category === 'Acciones' ? 'Acción' : preset.category);
    setShowDropdown(false);
    onAnalyze(
      preset.symbol,
      preset.category === 'Acciones' ? 'Acción' : preset.category,
      undefined,
      undefined,
      userIntent
    );
  };

  const handleSelectSP500Stock = (symbol: string, _name: string) => {
    setAssetQuery(symbol);
    setAssetType('Acción');
    setShowDropdown(false);
    onAnalyze(
      symbol,
      'Acción',
      undefined,
      undefined,
      userIntent
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-600" />
              Decisión de Inversión y Trading Multitemporal
            </h2>
            <p className="text-slate-600 text-sm mt-0.5">
              Analiza si conviene <strong className="text-emerald-700">COMPRAR</strong>, <strong className="text-rose-700">VENDER</strong> o <strong className="text-amber-700">MANTENER</strong> con sincronización en directo de Wall Street.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* SP500 Explorer Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSP500ModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Explorador S&P 500</span>
              <span className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                503 Acciones
              </span>
            </button>

            {/* 1-Week Horizon Badge */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Decisión Dinámica: <strong className="text-slate-900 font-bold">H1 a 1M</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Search Bar with S&P 500 Autocomplete Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1" ref={searchContainerRef}>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="asset-search-input"
                type="text"
                value={assetQuery}
                onChange={(e) => {
                  setAssetQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Busca en las 503 acciones de S&P 500 o ingresa ticker (ej: NVDA, AAPL, LLY, PLTR, MSFT, BTC)..."
                disabled={isLoading}
                autoComplete="off"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base transition-all disabled:opacity-60"
              />

              {/* Autocomplete Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-150">
                  <div className="px-3 py-2 bg-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      Acciones del S&P 500 encontradas ({suggestions.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSP500ModalOpen(true)}
                      className="text-emerald-700 hover:underline capitalize font-semibold"
                    >
                      Ver las 503 empresas →
                    </button>
                  </div>
                  {suggestions.map((stock) => (
                    <button
                      key={stock.symbol}
                      type="button"
                      onClick={() => handleSelectSP500Stock(stock.symbol, stock.name)}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50/70 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="bg-slate-900 group-hover:bg-emerald-700 text-white font-black text-xs px-2 py-1 rounded transition-colors shrink-0">
                          {stock.symbol}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 truncate">
                            {stock.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {stock.subIndustry}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {stock.isMegacap && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            Megacap
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {stock.sector}
                        </span>
                        <span className="text-emerald-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Asset Type Selector */}
            <div className="w-full sm:w-44">
              <select
                id="asset-type-select"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                disabled={isLoading}
                className="w-full py-3.5 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-60"
              >
                <option value="Acción">Acción (S&P 500 / NYSE)</option>
                <option value="Criptomoneda">Criptomoneda</option>
                <option value="Materia Prima">Materia Prima / Oro</option>
                <option value="Índice">Índice / ETF</option>
                <option value="Forex">Divisa (Forex)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              id="analyze-asset-submit-btn"
              type="submit"
              disabled={isLoading || !assetQuery.trim()}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Sincronizando Mercado NY...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analizar Decisión</span>
                </>
              )}
            </button>
          </div>

          {/* Intent Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Mi intención:
            </span>
            <button
              type="button"
              onClick={() => setUserIntent('EVALUATE')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                userIntent === 'EVALUATE'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🔍 Evaluar Decisión Táctica
            </button>
            <button
              type="button"
              onClick={() => setUserIntent('BUY')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                userIntent === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              📈 ¿Es momento de Comprar?
            </button>
            <button
              type="button"
              onClick={() => setUserIntent('SELL')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                userIntent === 'SELL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              📉 ¿Debo Vender / Tomar Ganancias?
            </button>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="ml-auto text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showAdvanced ? 'Ocultar filtros avanzados' : 'Parámetros opcionales'}
            </button>
          </div>

          {/* Advanced Filters Drawer */}
          {showAdvanced && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 animate-in fade-in duration-200">
              <div>
                <label htmlFor="ref-price-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Precio de referencia actual (Opcional):
                </label>
                <input
                  id="ref-price-input"
                  type="number"
                  step="any"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="Ej: 135.50"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="custom-context-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Pregunta o catalizador específico que te preocupe:
                </label>
                <input
                  id="custom-context-input"
                  type="text"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Ej: ¿Afectará el reporte de beneficios o IPC del jueves?"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Preset Assets Watchlist */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Acciones y activos para analizar en 1 clic:
              </span>

              {/* Category Filter */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                      activeCategory === cat
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredPresets.map((preset) => (
                <button
                  key={preset.symbol}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-2xs"
                >
                  <span className="font-black text-slate-950">{preset.symbol}</span>
                  <span className="text-slate-500 font-normal hidden sm:inline">({preset.name})</span>
                </button>
              ))}

              {/* Button to open all 503 stocks */}
              <button
                type="button"
                onClick={() => setIsSP500ModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Ver todas las 503 de S&P 500</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* S&P 500 Explorer Modal */}
      <SP500ExplorerModal
        isOpen={isSP500ModalOpen}
        onClose={() => setIsSP500ModalOpen(false)}
        onSelectStock={handleSelectSP500Stock}
      />
    </>
  );
};
