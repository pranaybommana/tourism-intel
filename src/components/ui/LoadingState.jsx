import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function LoadingState({
  message = 'Loading tourism intelligence...',
  className,
  height = 'h-64',
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', height, className)}>
      <div className="relative flex items-center justify-center w-12 h-12 mb-4">
        <div className="absolute w-12 h-12 rounded-full border border-cyan-500/20 animate-ping"></div>
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-300">{message}</p>
      <p className="text-xs text-slate-500 mt-1">Retrieving verified travel telemetry</p>
    </div>
  );
}

export default LoadingState;
