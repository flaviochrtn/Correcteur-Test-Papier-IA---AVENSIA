import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, FileCheck } from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';
import { FileData } from '../types';

interface FileUploaderProps {
  label: string;
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  selectedFiles: FileData[];
  onRemoveFile: (index: number) => void;
  description: string;
  colorClass?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  accept,
  multiple = false,
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  description,
  colorClass = "blue"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const borderColors = {
    blue: "border-blue-300 hover:border-blue-400 bg-blue-50",
    indigo: "border-indigo-300 hover:border-indigo-400 bg-indigo-50",
    emerald: "border-emerald-300 hover:border-emerald-400 bg-emerald-50",
  };
  
  const iconColors = {
    blue: "text-blue-500",
    indigo: "text-indigo-500",
    emerald: "text-emerald-500",
  };

  const themeBorder = borderColors[colorClass as keyof typeof borderColors] || borderColors.blue;
  const themeIcon = iconColors[colorClass as keyof typeof iconColors] || iconColors.blue;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center text-center h-48
          ${isDragging ? 'border-blue-500 bg-blue-100' : themeBorder}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files) {
              onFilesSelected(Array.from(e.target.files));
            }
          }}
        />
        
        <div className={`p-3 rounded-full bg-white shadow-sm mb-3 ${themeIcon}`}>
          <Upload size={24} />
        </div>
        <p className="text-sm font-medium text-slate-700">
          Cliquez pour uploader ou glissez-déposez
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {description}
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
           {selectedFiles.map((fileData, idx) => (
             <div key={`${fileData.file.name}-${idx}`} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded bg-slate-100 ${themeIcon}`}>
                     {fileData.mimeType.includes('image') ? <ImageIcon size={18} /> : <FileText size={18} />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-slate-800 truncate">{fileData.file.name}</span>
                    <span className="text-xs text-slate-500">{formatFileSize(fileData.file.size)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveFile(idx)}
                  className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                >
                  <X size={18} />
                </button>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};