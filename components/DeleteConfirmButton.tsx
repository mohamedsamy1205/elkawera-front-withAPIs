
import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmButtonProps {
  onConfirm: () => void;
  initialLabel?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  className?: string;
  confirmClassName?: string;
  iconSize?: number;
}

export const DeleteConfirmButton: React.FC<DeleteConfirmButtonProps> = ({ 
  onConfirm, 
  initialLabel = "Delete", 
  confirmLabel = "Confirm?", 
  className = "",
  confirmClassName = "bg-red-600 text-white hover:bg-red-700 border-red-500",
  iconSize = 16
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isConfirming) {
      const timer = setTimeout(() => setIsConfirming(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirming]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isConfirming) {
      onConfirm();
      setIsConfirming(false);
    } else {
      setIsConfirming(true);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`transition-all duration-200 ${isConfirming ? confirmClassName : className}`}
    >
      {isConfirming ? (
        <span className="flex items-center justify-center gap-2 animate-pulse">
           <AlertTriangle size={iconSize} /> {confirmLabel}
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
           <Trash2 size={iconSize} /> {initialLabel}
        </span>
      )}
    </button>
  );
};
