import React from 'react';
import { Calendar, Globe, ExternalLink, CheckSquare, Zap, Shield, HelpCircle, Clock } from 'lucide-react';
import { CatalystItem, DecisionActionPlan, GroundingSource, Timeframe, AssetAnalysisResult } from '../types';
import { getActiveTimeframeData, TIMEFRAME_CONFIGS } from '../utils/timeframeEngine';

interface CatalystsAndGroundingProps {
  catalysts?: CatalystItem[];
  actionPlan?: DecisionActionPlan;
  groundingSources?: GroundingSource[];
  assetName: string;
  timeframe?: Timeframe;
  fullAnalysis?: AssetAnalysisResult | null;
}

export const CatalystsAndGrounding: React.FC<CatalystsAndGroundingProps> = ({
  catalysts,
  actionPlan,
  groundingSources,
  assetName,
  timeframe = '1W',
  fullAnalysis,
}) => {
  const currentTf: Timeframe = (timeframe as Timeframe) || '1W';
  const tfConfig = TIMEFRAME_CONFIGS[currentTf] || TIMEFRAME_CONFIGS['1W'];
  const tfData = fullAnalysis ? getActiveTimeframeData(fullAnalysis, currentTf) : null;

  const activePlan = tfData?.actionPlan || actionPlan;
  const activeCatalysts = tfData?.catalysts || catalysts;

  const getBiasBadge = (bias: string) => {
    switch (bias) {
      case 'ALCISTA':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'BAJISTA':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'VOLATIL':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-8 mb-8">
      {/* Action Plan by Profile Synchronized to Timeframe */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              Plan Táctico de Acción Inmediata (Horizonte {tfConfig.label})
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Guía personalizada de ejecución para <strong className="text-slate-800 font-semibold">{tfConfig.sublabel}</strong> en {assetName}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-black text-emerald-900 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Marco Activo: {tfConfig.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* If looking to BUY */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider block">
              Si quieres COMPRAR ({tfConfig.label}):
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activePlan?.recommendationForBuyer || 'Esperar confirmación sobre el rango de entrada óptimo con stop loss ceñido.'}
            </p>
          </div>

          {/* If already HOLDING */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-2">
            <span className="text-xs font-black text-blue-900 uppercase tracking-wider block">
              Si YA TIENES el activo en cartera:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activePlan?.recommendationIfAlreadyHolding || 'Ajustar trailing stop para proteger ganancias y mantener mientras respete los soportes clave.'}
            </p>
          </div>

          {/* If looking to SELL */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-2">
            <span className="text-xs font-black text-rose-900 uppercase tracking-wider block">
              Si buscas VENDER o tomar ganancias:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activePlan?.recommendationForSeller || 'Colocar órdenes límite en la primera resistencia técnica para toma parcial.'}
            </p>
          </div>
        </div>

        {/* Step-by-step checklist */}
        {activePlan?.tacticalSteps && activePlan.tacticalSteps.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
              Pasos Secuenciales Recomendados ({tfConfig.label}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activePlan.tacticalSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-medium pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Catalysts & Grounding Sources Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catalysts Next Horizon */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Catalizadores & Eventos Clave ({tfConfig.label})
            </h4>
            <p className="text-xs text-slate-500">
              Noticias corporativas, vencimientos y reportes económicos para {tfConfig.sublabel}
            </p>
          </div>

          <div className="space-y-3">
            {activeCatalysts?.map((cat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    {cat.dateOrTiming}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBiasBadge(cat.bias)}`}>
                    Sesgo {cat.bias}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {cat.event}
                </p>
                <div className="text-[10px] text-slate-500 font-semibold">
                  Impacto estimado: <strong className="text-slate-800">{cat.potentialImpact}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Grounding & Real-time Web Sources */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Información Financiera & Fuentes en Vivo
              </h4>
              <p className="text-xs text-slate-500">
                Datos sincronizados mediante Google Search Grounding con la web financiera
              </p>
            </div>

            <div className="space-y-2.5">
              {groundingSources && groundingSources.length > 0 ? (
                groundingSources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="font-semibold text-slate-800 group-hover:text-emerald-800 truncate">
                        {source.title || 'Fuente de Cotizaciones e Información Financiera'}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
                  </a>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
                  Búsqueda web en tiempo real completada.
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer banner */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Nota de Gestión de Riesgo:</strong> Las decisiones de inversión en horizontes de {tfConfig.label} requieren estricto control de stop loss. Esta herramienta procesa datos cuantitativos y técnicos como soporte analítico profesional.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
