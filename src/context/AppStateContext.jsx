import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { APP_STATES, APP_STATE_META } from '../constants/appStates';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const { isOnline, isLowConnection, connectionDetails } = useOnlineStatus();
  const [batteryState, setBatteryState] = useState({ level: 1.0, charging: true, isLow: false });
  const [manualOverrideState, setManualOverrideState] = useState(null);

  // Monitor battery status if API available
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        const updateBattery = () => {
          const isLow = battery.level <= 0.2 && !battery.charging;
          setBatteryState({
            level: battery.level,
            charging: battery.charging,
            isLow,
          });
        };

        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);

        return () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
        };
      }).catch(() => {
        // Battery API permission denied or not supported
      });
    }
  }, []);

  // Compute active state based on hardware conditions or manual override
  const activeState = useMemo(() => {
    if (manualOverrideState) return manualOverrideState;
    if (!isOnline) return APP_STATES.OFFLINE_SAFETY;
    if (batteryState.isLow) return APP_STATES.LOW_BATTERY;
    if (isLowConnection) return APP_STATES.LOW_CONNECTIVITY;
    return APP_STATES.ONLINE;
  }, [manualOverrideState, isOnline, batteryState.isLow, isLowConnection]);

  const value = {
    appState: activeState,
    meta: APP_STATE_META[activeState],
    isOnline,
    isLowBattery: activeState === APP_STATES.LOW_BATTERY,
    isOfflineSafety: activeState === APP_STATES.OFFLINE_SAFETY,
    isLowConnectivity: activeState === APP_STATES.LOW_CONNECTIVITY,
    connectionDetails,
    batteryState,
    setAppStateOverride: setManualOverrideState,
    clearStateOverride: () => setManualOverrideState(null),
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
