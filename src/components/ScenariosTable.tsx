import React from 'react';
import { Table, TrendingUp, Compass, TrendingDown, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Scenarios1Week, Timeframe, AssetAnalysisResult } from '../types';
import { getActiveTimeframeData, TIMEFRAME_CONFIGS } from '../utils/timeframeEngine';

interface ScenariosTableProps {
  scenarios?: Scenarios1Week;
  assetName: string;
  currency?: string;
  timeframe?: Timeframe;
  fullAnalysis?: AssetAnalysisResult | null;
}

export const ScenariosTable: React.FC<ScenariosTableProps> = ({ 
  scenarios, 
  assetName,
  currency = 'USD',
  timeframe = '1W',
  fullAnalysis
}) => {
  const currentTf: Timeframe = (timeframe as Timeframe) || '1W';
  const tfConfig = TIMEFRAME_CONFIGS[currentTf] || TIMEFRAME_CONFIGS['1W'];
  const tfData = fullAnalysis ? getActiveTimeframeData(fullAnalysis, currentTf) : null;
  const activeScenarios = tfData?.scenarios || scenarios;

  if (!activeScenarios) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Table className="w-5 h-5 text-emerald-600" />
            Tabla Comparativa de Escenarios ({tfConfig.label})
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Matriz probabilística para anticipar los posibles desenlaces a <strong className="text-slate-800 font-semibold">{tfConfig.sublabel}</strong> en {assetName}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Calibrado: {tfConfig.label}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-extrabold uppercase tracking-wider text-slate-500 bg-slate-50/80">
              <th className="py-3 px-4 rounded-l-xl">Escenario ({tfConfig.label})</th>
              <th className="py-3 px-4">Probabilidad</th>
              <th className="py-3 px-4">Precio Objetivo</th>
              <th className="py-3 px-4">Retorno Esperado</th>
              <th className="py-3 px-4">Descripción de Dinámica</th>
              <th className="py-3 px-4 rounded-r-xl">Gatillos / Triggers Clave</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {/* Bullish Scenario */}
            <tr className="hover:bg-emerald-50/30 transition-colors">
              <td className="py-4 px-4 font-bold text-emerald-900 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold">Escenario Alcista</div>
                  <div className="text-[11px] font-normal text-emerald-700">Impulso a resistencias</div>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="font-extrabold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full text-xs border border-emerald-300">
                  {activeScenarios.bullish?.probability}%
                </span>
              </td>
              <td className="py-4 px-4 font-extrabold text-slate-900">
                ${activeScenarios.bullish?.target} {currency}
              </td>
              <td className="py-4 px-4 font-extrabold text-emerald-600">
                {activeScenarios.bullish?.changePercent}
              </td>
              <td className="py-4 px-4 text-slate-600 text-xs max-w-xs leading-relaxed">
                {activeScenarios.bullish?.description}
              </td>
              <td className="py-4 px-4 text-xs text-slate-700">
                <ul className="space-y-1">
                  {activeScenarios.bullish?.triggers?.map((trig, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{trig}</span>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>

            {/* Base Case Scenario */}
            <tr className="hover:bg-blue-50/30 transition-colors">
              <td className="py-4 px-4 font-bold text-blue-900 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-100 text-blue-700">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold">Caso Base</div>
                  <div className="text-[11px] font-normal text-blue-700">Consolidación / Rango</div>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="font-extrabold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-full text-xs border border-blue-300">
                  {activeScenarios.base?.probability}%
                </span>
              </td>
              <td className="py-4 px-4 font-extrabold text-slate-900">
                ${activeScenarios.base?.target} {currency}
              </td>
              <td className="py-4 px-4 font-extrabold text-blue-600">
                {activeScenarios.base?.changePercent}
              </td>
              <td className="py-4 px-4 text-slate-600 text-xs max-w-xs leading-relaxed">
                {activeScenarios.base?.description}
              </td>
              <td className="py-4 px-4 text-xs text-slate-700">
                <ul className="space-y-1">
                  {activeScenarios.base?.triggers?.map((trig, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{trig}</span>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>

            {/* Bearish Scenario */}
            <tr className="hover:bg-rose-50/30 transition-colors">
              <td className="py-4 px-4 font-bold text-rose-900 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-rose-100 text-rose-700">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold">Escenario Bajista</div>
                  <div className="text-[11px] font-normal text-rose-700">Activación de Stop Loss</div>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="font-extrabold text-rose-700 bg-rose-100/70 px-2.5 py-1 rounded-full text-xs border border-rose-300">
                  {activeScenarios.bearish?.probability}%
                </span>
              </td>
              <td className="py-4 px-4 font-extrabold text-slate-900">
                ${activeScenarios.bearish?.target} {currency}
              </td>
              <td className="py-4 px-4 font-extrabold text-rose-600">
                {activeScenarios.bearish?.changePercent}
              </td>
              <td className="py-4 px-4 text-slate-600 text-xs max-w-xs leading-relaxed">
                {activeScenarios.bearish?.description}
              </td>
              <td className="py-4 px-4 text-xs text-slate-700">
                <ul className="space-y-1">
                  {activeScenarios.bearish?.triggers?.map((trig, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      <span>{trig}</span>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
