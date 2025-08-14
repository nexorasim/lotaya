import React from 'react';

interface SpinnerProps {
  size?: string;
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'h-8 w-8', color = 'text-blue-500' }) => {
  return (
    <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-transparent ${size} ${color}`}>
      <div className="sr-only">Loading...</div>
    </div>
  );
};

export default Spinner;