import React from 'react';
import { cn } from '../../utils/cn';

export function GlassButton({
  children,
  className,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-ocean-950 font-semibold shadow-cyan-glow hover:shadow-cyan-glow-lg border border-cyan-300/40 active:scale-[0.98]',
    secondary:
      'bg-slate-800/80 hover:bg-slate-700/90 text-cyan-200 border border-cyan-500/30 hover:border-cyan-400/60 backdrop-blur-md',
    outline:
      'bg-transparent hover:bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 hover:border-cyan-300',
    danger:
      'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:border-rose-400',
    ghost:
      'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-cyan-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {Icon && <Icon className={cn('shrink-0', size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4')} />}
      {children}
    </button>
  );
}

export default GlassButton;
