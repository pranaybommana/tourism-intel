import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

/**
 * Error Boundary to isolate Google Maps rendering failures.
 * Prevents entire page, Navbar, and AI Assistant from crashing if Maps fails.
 */
export class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[MapErrorBoundary] Google Maps runtime error intercepted:', {
      message: error?.message || 'Unknown map error',
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <GlassCard className="p-8 text-center flex flex-col items-center justify-center min-h-[450px] border-rose-500/40 bg-slate-950/90">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-rose-glow animate-pulse">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1.5">
            Google Maps Engine Unavailable
          </h3>
          <p className="text-xs text-slate-300 max-w-md mb-4 leading-relaxed">
            The interactive map could not be displayed due to a network interruption,
            restricted API key, or browser graphics constraint. All other safety telemetry and
            emergency features remain fully active.
          </p>

          <div className="flex items-center gap-3">
            <GlassButton
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={this.handleRetry}
            >
              Reload Map Engine
            </GlassButton>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 max-w-md text-left font-mono space-y-1">
            <span className="text-rose-400 font-bold block">Status Code: MAP_INITIALIZATION_FAULT</span>
            {this.state.error?.message && (
              <div className="p-2 rounded bg-rose-950/40 border border-rose-500/20 text-rose-300 text-[10px] break-all">
                {this.state.error.message}
              </div>
            )}
            <span className="text-slate-400 block text-[10px]">
              Safe corridors, voice guidance, and emergency SOS 112 remain isolated and fully active.
            </span>
          </div>
        </GlassCard>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
