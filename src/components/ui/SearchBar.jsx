import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search destinations, places, or safety zones...',
  className,
  autoFocus = false,
}) {
  return (
    <div className={cn('relative w-full', className)}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4 text-cyan-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-cyan-500/20 focus:border-cyan-400/60 rounded-xl text-sm text-slate-100 placeholder-slate-400 backdrop-blur-md outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
