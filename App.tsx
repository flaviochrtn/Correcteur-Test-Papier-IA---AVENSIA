import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { GradingReport } from './components/GradingReport';
import { processFile } from './utils/fileUtils';
import { FileData, GradingResult } from './types';
import { gradeStudentPaper } from './services/gemini';
import { BrainCircuit, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [keyFile, setKeyFile] = useState<FileData[]>([]);
  const [studentFiles, setStudentFiles] = useState<FileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleKeySelected = async (files: File[]) => {
    // Only accept one file for key
    if (files.length > 0) {
      try {
        const processed = await processFile(files[0]);
        setKeyFile([processed]);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la lecture du fichier corrigé.");
      }
    }
  };

  const handleStudentFilesSelected = async (files: File[]) => {
    try {
      const processedPromises = files.map(processFile);
      const processed = await Promise.all(processedPromises);
      setStudentFiles(prev => [...prev, ...processed]);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la lecture des copies étudiant.");
    }
  };

  const removeKeyFile = () => setKeyFile([]);
  
  const removeStudentFile = (index: number) => {
    setStudentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGrade = async () => {
    if (keyFile.length === 0 || studentFiles.length === 0) {
      setError("Veuillez uploader le corrigé ET au moins une page de la copie étudiant.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const gradingResult = await gradeStudentPaper(keyFile[0], studentFiles);
      setResult(gradingResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de la correction. Vérifiez votre clé API ou le format des fichiers.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <BrainCircuit size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Correcteur Test Papier AI</h1>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Propulsé par Gemini 3 Pro
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Intro Section */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
           <h2 className="text-3xl font-bold text-slate-900 mb-4">Correction automatisée et stricte</h2>
           <p className="text-slate-600">
             Uploadez le corrigé officiel et les scans de la copie d'étudiant. L'IA analysera l'écriture, appliquera le barème et fournira un rapport détaillé.
           </p>
        </div>

        {/* Upload Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-2 mb-4 text-indigo-700">
                <Sparkles size={20} />
                <h3 className="font-semibold text-lg">1. Corrigé & Barème</h3>
             </div>
             <FileUploader
               label="Document de référence"
               accept=".pdf,image/*,.txt"
               selectedFiles={keyFile}
               onFilesSelected={handleKeySelected}
               onRemoveFile={removeKeyFile}
               description="PDF ou Image du corrigé officiel avec les points."
               colorClass="indigo"
             />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-2 mb-4 text-blue-700">
                <Sparkles size={20} />
                <h3 className="font-semibold text-lg">2. Copie de l'Étudiant</h3>
             </div>
             <FileUploader
               label="Scans des réponses"
               accept=".pdf,image/*"
               multiple={true}
               selectedFiles={studentFiles}
               onFilesSelected={handleStudentFilesSelected}
               onRemoveFile={removeStudentFile}
               description="Photos des pages (JPG, PNG) ou PDF multi-pages."
               colorClass="blue"
             />
          </div>

        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 mb-6 animate-pulse">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handleGrade}
            disabled={isProcessing || keyFile.length === 0 || studentFiles.length === 0}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform hover:scale-105
              ${isProcessing 
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200 ring-4 ring-transparent hover:ring-indigo-100'}
            `}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" />
                Analyse et correction en cours...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Lancer la Correction
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && <GradingReport result={result} />}
        
      </main>
    </div>
  );
};

export default App;
