import React, { useState } from 'react';
import { GradingResult, FlagType } from '../types';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Download, FileJson, Copy, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GradingReportProps {
  result: GradingResult;
}

export const GradingReport: React.FC<GradingReportProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const getStatusColor = (score: number, max: number) => {
    const percentage = score / max;
    if (percentage === 1) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (percentage >= 0.5) return 'bg-blue-50 text-blue-800 border-blue-200';
    return 'bg-red-50 text-red-800 border-red-200';
  };

  const getFlagBadge = (flag: FlagType) => {
    switch (flag) {
      case FlagType.ILLEGIBLE:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><HelpCircle size={12} className="mr-1"/> Illisible</span>;
      case FlagType.AMBIGUOUS:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800"><AlertTriangle size={12} className="mr-1"/> Ambigu</span>;
      case FlagType.MISSING:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-800"><XCircle size={12} className="mr-1"/> Manquant</span>;
      default:
        return null;
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `correction_${result.studentName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const chartData = result.questions.map(q => ({
    name: q.id,
    score: q.score,
    max: q.maxScore,
    percentage: (q.score / q.maxScore) * 100
  }));

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200 mt-8 animate-fade-in-up">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="text-yellow-400" /> 
            Rapport de Correction
          </h2>
          <p className="text-slate-400 mt-1">Étudiant: <span className="text-white font-medium">{result.studentName}</span></p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="text-right">
             <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total</div>
             <div className="text-3xl font-bold">{result.totalScore} <span className="text-slate-500 text-xl">/ {result.maxTotalScore}</span></div>
           </div>
           <div className="h-12 w-px bg-slate-700"></div>
           <div className="text-right">
             <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Note / 20</div>
             <div className={`text-4xl font-black ${result.finalGrade20 >= 10 ? 'text-emerald-400' : 'text-red-400'}`}>
               {result.finalGrade20.toFixed(2)}
             </div>
           </div>
        </div>
      </div>

      {/* Global Comment */}
      <div className="p-6 bg-slate-50 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Appréciation Générale</h3>
        <p className="text-slate-800 italic">"{result.globalComment}"</p>
      </div>

       {/* Chart Section */}
       <div className="p-6 border-b border-slate-100 h-64 w-full">
         <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Distribution des points</h3>
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.percentage >= 80 ? '#10b981' : entry.percentage >= 50 ? '#3b82f6' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
         </ResponsiveContainer>
       </div>

      {/* Details Table */}
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
              <th className="p-4 font-semibold w-20">Question</th>
              <th className="p-4 font-semibold w-1/4">Réponse extraite</th>
              <th className="p-4 font-semibold">Feedback & Analyse</th>
              <th className="p-4 font-semibold text-right w-24">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {result.questions.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 align-top font-medium text-slate-900">
                  {q.id}
                  <div className="mt-2 flex flex-col gap-1">
                     {q.flags.map((flag, i) => (flag !== FlagType.NONE ? <div key={i}>{getFlagBadge(flag)}</div> : null))}
                  </div>
                </td>
                <td className="p-4 align-top">
                  <div className="text-sm text-slate-700 bg-white border border-slate-200 p-2 rounded italic font-serif">
                    {q.extractedAnswer || <span className="text-slate-400 text-xs not-italic">Aucune réponse détectée</span>}
                  </div>
                </td>
                <td className="p-4 align-top">
                   <p className="text-sm text-slate-600">{q.feedback}</p>
                </td>
                <td className="p-4 align-top text-right">
                   <span className={`inline-block px-2 py-1 rounded text-sm font-bold border ${getStatusColor(q.score, q.maxScore)}`}>
                     {q.score} / {q.maxScore}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
        <button
          onClick={handleCopyJson}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
        >
          {copied ? <CheckCircle size={16} className="text-green-500"/> : <Copy size={16}/>}
          {copied ? 'Copié !' : 'Copier JSON'}
        </button>
        <button
          onClick={handleDownloadJson}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-sm font-medium"
        >
          <Download size={16} />
          Télécharger JSON
        </button>
      </div>
    </div>
  );
};
