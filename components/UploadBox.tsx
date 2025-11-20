import React, { useRef } from 'react';

interface UploadBoxProps {
  label: string;
  subLabel?: string;
  accept: string;
  file?: File | null; // Optional now as it might be used for multi-upload where we don't show a single file name here
  onFileSelect: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  icon?: React.ReactNode;
  multiple?: boolean;
  count?: number;
}

const UploadBox: React.FC<UploadBoxProps> = ({ label, subLabel, accept, file, onFileSelect, onFilesSelect, icon, multiple, count }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (multiple && onFilesSelect) {
        onFilesSelect(Array.from(e.dataTransfer.files));
      } else if (e.dataTransfer.files[0]) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (multiple && onFilesSelect) {
        onFilesSelect(Array.from(e.target.files));
      } else if (e.target.files[0]) {
        onFileSelect(e.target.files[0]);
      }
    }
  };

  // Determine visual state
  const isActive = file || (count && count > 0);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer group
          ${isActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <div className={`p-3 rounded-full ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:text-blue-500 transition-colors'}`}>
            {icon || (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            )}
          </div>
          
          <div className="space-y-1">
            <p className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
              {multiple && count && count > 0 
                ? `${count} Dateien ausgewählt`
                : file 
                  ? file.name 
                  : 'Datei(en) auswählen oder hierher ziehen'}
            </p>
            {subLabel && !isActive && (
              <p className="text-xs text-slate-400">{subLabel}</p>
            )}
             {multiple && isActive && (
              <p className="text-xs text-blue-500 font-medium">+ Weitere hinzufügen</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadBox;