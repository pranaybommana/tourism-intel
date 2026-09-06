import React from 'react';
import { cn } from '../../utils/cn';

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
  align = 'left',
}) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6',
        align === 'center' && 'text-center md:text-center items-center',
        className
      )}
    >
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default SectionHeader;
