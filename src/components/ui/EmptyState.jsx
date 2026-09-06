import React from 'react';
import { Compass, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import GlassButton from './GlassButton';

export function EmptyState({
  title = 'No Results Found',
  description = 'No matching destinations or tourist places were found.',
  actionLabel,
  onAction,
  icon: Icon = Compass,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center glass-panel rounded-2xl my-6', className)}>
      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <GlassButton variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </GlassButton>
      )}
    </div>
  );
}

export default EmptyState;
