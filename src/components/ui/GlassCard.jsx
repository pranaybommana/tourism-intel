import React from 'react';
import { cn } from '../../utils/cn';

export function GlassCard({
  children,
  className,
  glow = false,
  subtle = false,
  interactive = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl transition-all duration-300',
        subtle
          ? 'glass-panel-subtle'
          : glow
          ? 'glass-panel-glow'
          : 'glass-panel',
        interactive &&
          'cursor-pointer hover:border-cyan-400/50 hover:shadow-cyan-glow hover:-translate-y-0.5 active:translate-y-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
