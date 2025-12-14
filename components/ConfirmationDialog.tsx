import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

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
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Slight delay for smooth entrance
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for exit animation before hiding
      setTimeout(() => setIsVisible(false), 200);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 200);
  };

  const handleConfirm = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onConfirm();
      onClose();
    }, 150);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isAnimating ? 'bg-black/60 backdrop-blur-md' : 'bg-black/0 backdrop-blur-none'
        }`}
      onClick={handleClose}
    >
      <div
        className={`bg-gradient-to-br from-gray-900 via-gray-900 to-black border-2 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden transition-all duration-300 ease-out ${isAnimating
            ? 'scale-100 opacity-100 translate-y-0 border-red-500/30'
            : 'scale-95 opacity-0 translate-y-4 border-white/10'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated background glow */}
        <div className={`absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'
          }`} />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
        >
          <X size={20} />
        </button>

        <div className="relative p-8 flex flex-col items-center text-center">
          {/* Icon with pulse animation */}
          <div className={`w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)] border-2 border-red-500/20 transition-all duration-500 ${isAnimating ? 'scale-100 rotate-0' : 'scale-0 rotate-45'
            }`}>
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
            <Trash2 size={36} className="relative z-10" />
          </div>

          {/* Title with slide-in animation */}
          <h3 className={`text-2xl font-display font-bold uppercase text-white mb-3 transition-all duration-300 delay-75 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
            {title}
          </h3>

          {/* Message with slide-in animation */}
          <p className={`text-gray-400 mb-8 leading-relaxed max-w-sm transition-all duration-300 delay-100 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
            {message}
          </p>

          {/* Buttons with slide-in animation */}
          <div className={`flex gap-4 w-full transition-all duration-300 delay-150 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
            <button
              onClick={handleClose}
              className="flex-1 py-3.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white border-2 border-white/10 hover:border-white/20 transition-all duration-200 uppercase text-sm tracking-wider hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:shadow-[0_0_35px_rgba(220,38,38,0.7)] transition-all duration-200 uppercase text-sm tracking-wider hover:scale-105 active:scale-95 border-2 border-red-500/50"
            >
              Yes, Delete
            </button>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className={`h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent transition-all duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'
          }`} />
      </div>
    </div>
  );
};