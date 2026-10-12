import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Building2, 
  TrendingUp, 
  Sparkles, 
  Layers, 
  Check, 
  ExternalLink,
  Star,
  Filter,
  BarChart3,
  Cpu,
  HeartPulse,
  Landmark,
  ShoppingBag,
  Radio,
  Wrench,
  Coffee,
  Flame,
  Zap,
  Home,
  Boxes
} from 'lucide-react';
import { SP500_STOCKS, SP500_SECTORS, SP500Stock, SP500Sector, searchSP500Stocks, getSP500SectorCounts } from '../data/sp500';

interface SP500ExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock: (symbol: string, name: string) => void;
}

export const SP500ExplorerModal: React.FC<SP500ExplorerModalProps> = ({
  isOpen,
  onClose,
  onSelectStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<SP500Sector>('Todos');
  const [onlyMegacaps, setOnlyMegacaps] = useState(false);

  const sectorCounts = useMemo(() => getSP500SectorCounts(), []);

  const filteredStocks = useMemo(() => {
    let list = searchSP500Stocks(searchQuery, selectedSector, 600);
    if (onlyMegacaps) {
      list = list.filter((s) => s.isMegacap);
    }
    return list;
  }, [searchQuery, selectedSector, onlyMegacaps]);

  if (!isOpen) return null;

  const getSectorColor = (sector: string) => {
    switch (sector) {
      case 'Tecnología':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Salud':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Financiero':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Consumo Discrecional':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Servicios de Comunicación':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Industrial':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Consumo Básico':
        return 'bg-lime-50 text-lime-800 border-lime-200';
      case 'Energía':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Servicios Públicos':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Bienes Raíces':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Materiales':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSectorIcon = (sector: string) => {
    switch (sector) {
      case 'Tecnología': return <Cpu className="w-3.5 h-3.5" />;
      case 'Salud': return <HeartPulse className="w-3.5 h-3.5" />;
      case 'Financiero': return <Landmark className="w-3.5 h-3.5" />;
      case 'Consumo Discrecional': return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'Servicios de Comunicación': return <Radio className="w-3.5 h-3.5" />;
      case 'Industrial': return <Wrench className="w-3.5 h-3.5" />;
      case 'Consumo Básico': return <Coffee className="w-3.5 h-3.5" />;
      case 'Energía': return <Flame className="w-3.5 h-3.5" />;
      case 'Servicios Públicos': return <Zap className="w-3.5 h-3.5" />;
      case 'Bienes Raíces': return <Home className="w-3.5 h-3.5" />;
      case 'Materiales': return <Boxes className="w-3.5 h-3.5" />;
      default: return <Building2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Índice S&P 500 Completo
              </span>
              <span className="text-xs text-slate-400">
                {SP500_STOCKS.length} Empresas de Wall Street
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-400" />
              Explorador y Selector de Acciones del S&P 500
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Selecciona cualquier acción del Standard & Poor&apos;s 500 para evaluar al instante su cotización en Nueva York y su recomendación táctica de compra/venta de H1 a 1 Mes.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ticker o nombre (ej: AAPL, Nvidia, Tesla, JPM, Pfizer, Eli Lilly...)"
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Megacap Toggle */}
            <button
              type="button"
              onClick={() => setOnlyMegacaps(!onlyMegacaps)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shadow-sm ${
                onlyMegacaps
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-amber-500/20'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyMegacaps ? 'fill-slate-950 text-slate-950' : 'text-amber-500'}`} />
              Solo Megacaps Lideres
            </button>
          </div>

          {/* Sector Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
            {SP500_SECTORS.map((sector) => {
              const count = sectorCounts[sector] ?? 0;
              const isSelected = selectedSector === sector;
              return (
                <button
                  key={sector}
                  type="button"
                  onClick={() => setSelectedSector(sector)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-slate-900 text-emerald-400 border-slate-900 shadow-sm font-bold'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {sector !== 'Todos' && getSectorIcon(sector)}
                  <span>{sector}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results List Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 max-h-[500px]">
          {filteredStocks.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-slate-300">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No se encontraron acciones</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No hay coincidencias para &quot;{searchQuery}&quot; en el sector seleccionado. Prueba a buscar por símbolo (ej: AAPL, TSLA, NVDA) o limpia el filtro.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedSector('Todos'); setOnlyMegacaps(false); }}
                className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Restablecer Búsqueda
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3 px-1">
                <span>Mostrando {filteredStocks.length} empresas del S&P 500:</span>
                <span className="text-slate-400">Haz clic en cualquier acción para analizarla</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {filteredStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    type="button"
                    onClick={() => {
                      onSelectStock(stock.symbol, stock.name);
                      onClose();
                    }}
                    className="p-3.5 bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-400 rounded-xl text-left transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-950 text-base group-hover:text-emerald-700 tracking-tight">
                            {stock.symbol}
                          </span>
                          {stock.isMegacap && (
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              Megacap
                            </span>
                          )}
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${getSectorColor(stock.sector)}`}>
                          {getSectorIcon(stock.sector)}
                          {stock.sector}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-slate-900">
                        {stock.name}
                      </h4>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {stock.subIndustry}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-600 font-semibold group-hover:underline flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        Analizar Decisión
                      </span>
                      <span className="text-slate-400 group-hover:text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-slate-500">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>
              Incluye las <strong>503 acciones</strong> constituyentes del índice <strong>S&P 500</strong>.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors"
          >
            Cerrar Explorador
          </button>
        </div>
      </div>
    </div>
  );
};
