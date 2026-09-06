import React from 'react';
import { cn } from '../../utils/cn';

export function CategoryChip({
  label,
  active = false,
  onClick,
  icon: Icon,
  count,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border select-none whitespace-nowrap',
        active
          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-cyan-glow'
          : 'bg-slate-900/40 text-slate-400 border-slate-700/50 hover:border-cyan-500/30 hover:text-slate-200',
        className
      )}
    >
      {Icon && <Icon className={cn('w-3.5 h-3.5', active ? 'text-cyan-300' : 'text-slate-400')} />}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={cn(
            'ml-1 px-1.5 py-0.2 rounded-full text-[10px]',
            active ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default CategoryChip;
