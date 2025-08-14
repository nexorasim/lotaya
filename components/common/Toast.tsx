import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';

interface ToastProps {
  toast: ToastType;
}

const ICONS = {
  success: <CheckCircle className="text-green-500" size={24} />,
  error: <XCircle className="text-red-500" size={24} />,
  info: <Info className="text-blue-500" size={24} />,
};

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
        removeToast(toast.id)
    }, 300); // match animation duration
  }

  return (
    <div
      className={`
        flex items-start gap-4 w-full max-w-sm p-4 rounded-xl shadow-2xl border
        bg-gray-800/80 backdrop-blur-lg border-gray-700/60
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <div className="flex-shrink-0">{ICONS[toast.type]}</div>
      <div className="flex-grow">
        <p className="text-sm font-medium text-white">{toast.message}</p>
      </div>
      <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;