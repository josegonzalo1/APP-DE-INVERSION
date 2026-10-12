import React from 'react';
import { ShieldCheck, AlertCircle, Sparkles, Flame, HelpCircle } from 'lucide-react';
import { SwotAnalysis } from '../types';

interface SwotAnalysisSectionProps {
  swot: SwotAnalysis;
  assetName: string;
}

export const SwotAnalysisSection: React.FC<SwotAnalysisSectionProps> = ({ swot, assetName }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-8">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                FODA
              </span>
              Matriz de Análisis FODA / SWOT a 1 Semana
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Evaluación estructural interna y externa para calibrar la probabilidad de éxito en {assetName}
            </p>
          </div>

          <div className="flex gap-2 text-[11px] font-bold text-slate-600">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">Interno: F / D</span>
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">Externo: O / A</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* F - FORTALEZAS (Strengths) */}
        <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm border-b border-blue-200/70 pb-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>FORTALEZAS (Factores Internos Positivos)</span>
          </div>
          <ul className="space-y-2.5">
            {swot?.strengths?.map((item, idx) => (
              <li key={idx} className="bg-white p-3 rounded-lg border border-blue-100 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {item.title}
                </div>
                <p className="text-slate-600 pl-3 leading-relaxed">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* O - OPORTUNIDADES (Opportunities) */}
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm border-b border-emerald-200/70 pb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>OPORTUNIDADES (Catalizadores Externos)</span>
          </div>
          <ul className="space-y-2.5">
            {swot?.opportunities?.map((item, idx) => (
              <li key={idx} className="bg-white p-3 rounded-lg border border-emerald-100 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {item.title}
                </div>
                <p className="text-slate-600 pl-3 leading-relaxed">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* D - DEBILIDADES (Weaknesses) */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm border-b border-amber-200/70 pb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>DEBILIDADES (Vulnerabilidades Técnicas Internas)</span>
          </div>
          <ul className="space-y-2.5">
            {swot?.weaknesses?.map((item, idx) => (
              <li key={idx} className="bg-white p-3 rounded-lg border border-amber-100 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {item.title}
                </div>
                <p className="text-slate-600 pl-3 leading-relaxed">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* A - AMENAZAS (Threats) */}
        <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm border-b border-rose-200/70 pb-2">
            <Flame className="w-4 h-4 text-rose-600" />
            <span>AMENAZAS (Riesgos Macroeconómicos & de Mercado)</span>
          </div>
          <ul className="space-y-2.5">
            {swot?.threats?.map((item, idx) => (
              <li key={idx} className="bg-white p-3 rounded-lg border border-rose-100 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  {item.title}
                </div>
                <p className="text-slate-600 pl-3 leading-relaxed">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
