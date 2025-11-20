import React, { useRef } from 'react';

interface UploadBoxProps {
  label: string;
  subLabel?: string;
  accept: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  icon?: React.ReactNode;
}

const UploadBox: React.FC<UploadBoxProps> = ({ label, subLabel, accept, file, onFileSelect, icon }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer group
          ${file 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        />
        
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <div className={`p-3 rounded-full ${file ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:text-blue-500 transition-colors'}`}>
            {icon || (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            )}
          </div>
          
          <div className="space-y-1">
            <p className={`text-sm font-medium ${file ? 'text-blue-700' : 'text-slate-700'}`}>
              {file ? file.name : 'Datei auswählen oder hierher ziehen'}
            </p>
            {subLabel && !file && (
              <p className="text-xs text-slate-400">{subLabel}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadBox;