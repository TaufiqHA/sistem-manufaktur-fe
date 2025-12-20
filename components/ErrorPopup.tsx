import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ErrorPopupProps {
  message: string | null;
  onClose: () => void;
}

export const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Terjadi Kesalahan</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-red-600 text-white rounded-[16px] font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
