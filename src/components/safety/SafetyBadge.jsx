import React from 'react';
import StatusBadge from '../ui/StatusBadge';

export function SafetyBadge({ level = 'SAFE', size = 'md', showDescription = false }) {
  return (
    <div className="inline-flex flex-col gap-1">
      <StatusBadge status={level} size={size} />
      {showDescription && (
        <span className="text-[10px] text-slate-400">
          Verified by local tourism police protocol
        </span>
      )}
    </div>
  );
}

export default SafetyBadge;
