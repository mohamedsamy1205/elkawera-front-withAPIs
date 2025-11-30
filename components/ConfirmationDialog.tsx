import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen, onClose, onConfirm, title, message
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <AlertTriangle size={32} />
          </div>
          
          <h3 className="text-2xl font-display font-bold uppercase text-white mb-2">{title}</h3>
          <p className="text-gray-400 mb-8 leading-relaxed">{message}</p>
          
          <div className="flex gap-4 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors uppercase text-sm tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all uppercase text-sm tracking-wider"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};