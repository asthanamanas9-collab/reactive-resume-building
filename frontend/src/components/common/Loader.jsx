import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center text-blue-600 gap-3">
      <Loader2 className="animate-spin" size={40} />
      <p className="text-sm font-medium text-slate-500 animate-pulse">Loading data...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        {content}
      </div>
    );
  }

  return <div className="p-12 flex justify-center w-full">{content}</div>;
};

export default Loader;
