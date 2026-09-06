import React from 'react';
import { cn } from '../../utils/cn';
import { ShieldCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { getSafetyConfig } from '../../utils/safetyUtils';

export function StatusBadge({
  status = 'SAFE',
  label,
  size = 'md',
  showIcon = true,
  className,
}) {
  const config = getSafetyConfig(status);
  const displayLabel = label || config.label;

  const icons = {
    SAFE: ShieldCheck,
    MODERATE: Info,
    CAUTION: AlertTriangle,
    RESTRICTED: AlertCircle,
  };

  const IconComponent = icons[status.toUpperCase()] || ShieldCheck;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-medium gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-semibold gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border backdrop-blur-md transition-colors',
        config.badgeClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;
