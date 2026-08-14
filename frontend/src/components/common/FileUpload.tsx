import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, X, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  selectedFile?: File | null;
  onClearFile?: () => void;
  title?: string;
  description?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '.xlsx, .xls, .csv',
  maxSizeMB = 10,
  disabled = false,
  selectedFile = null,
  onClearFile,
  title = 'Upload Voter Register',
  description = 'Upload .xlsx or .csv file with columns: VoterID, Name, Email',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = (file: File) => {
    setErrorMsg(null);
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setErrorMsg(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
        id="excel-file-upload-input"
      />

      {selectedFile ? (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 truncate">
                  {selectedFile.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-100/60 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB • Validated format
              </p>
            </div>
          </div>
          {onClearFile && (
            <button
              onClick={onClearFile}
              disabled={disabled}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
              aria-label="Remove selected file"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
            isDragOver
              ? 'border-amber-500 bg-amber-50/40 scale-[0.99]'
              : 'border-slate-300 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-400'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="p-3.5 rounded-2xl bg-white shadow-xs border border-slate-200 text-slate-700 mb-3.5">
            <UploadCloud className="w-7 h-7 text-amber-600" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">{title}</h4>
          <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Choose Excel File
          </Button>
        </div>
      )}

      {errorMsg && <p className="mt-2 text-xs text-red-600 font-medium">{errorMsg}</p>}
    </div>
  );
};
