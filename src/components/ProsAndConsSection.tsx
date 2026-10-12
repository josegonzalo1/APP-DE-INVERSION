import React from 'react';
import { CheckCircle2, XCircle, ThumbsUp, ThumbsDown, Scale } from 'lucide-react';
import { ProsAndCons } from '../types';

interface ProsAndConsSectionProps {
  prosAndCons: ProsAndCons;
  assetName: string;
}

export const ProsAndConsSection: React.FC<ProsAndConsSectionProps> = ({ prosAndCons, assetName }) => {
  const getWeightBadge = (weight: string) => {
    switch (weight) {
      case 'ALTO':
        return 'bg-slate-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded';
      case 'MEDIO':
        return 'bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded';
      case 'BAJO':
        return 'bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            Balanza de Pros y Contras (Ventajas vs. Desventajas)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Factores determinantes para la toma de decisión a 1 semana en {assetName}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {prosAndCons?.pros?.length || 0} Ventajas
          </span>
          <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            {prosAndCons?.cons?.length || 0} Desventajas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros Column */}
        <div className="bg-emerald-50/40 rounded-xl border border-emerald-200/80 p-5 space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-base border-b border-emerald-200/60 pb-2">
            <div className="p-1 rounded-md bg-emerald-500 text-white">
              <ThumbsUp className="w-4 h-4" />
            </div>
            <span>Ventajas & Argumentos de Compra</span>
          </div>

          <div className="space-y-3">
            {prosAndCons?.pros?.map((pro, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h4 className="font-bold text-sm text-slate-900">{pro.title}</h4>
                  </div>
                  <span className={getWeightBadge(pro.weight)}>
                    Impacto {pro.weight}
                  </span>
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  {pro.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cons Column */}
        <div className="bg-rose-50/40 rounded-xl border border-rose-200/80 p-5 space-y-4">
          <div className="flex items-center gap-2 text-rose-900 font-extrabold text-base border-b border-rose-200/60 pb-2">
            <div className="p-1 rounded-md bg-rose-500 text-white">
              <ThumbsDown className="w-4 h-4" />
            </div>
            <span>Desventajas & Riesgos Semanales</span>
          </div>

          <div className="space-y-3">
            {prosAndCons?.cons?.map((con, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-rose-100 shadow-2xs space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <h4 className="font-bold text-sm text-slate-900">{con.title}</h4>
                  </div>
                  <span className={getWeightBadge(con.weight)}>
                    Impacto {con.weight}
                  </span>
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  {con.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
