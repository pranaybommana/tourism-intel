import { useState, useEffect } from 'react';

/**
 * Hook to monitor device online status and network speed
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [isLowConnection, setIsLowConnection] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState({
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API if supported
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      const updateConnection = () => {
        const effectiveType = connection.effectiveType || '4g';
        const downlink = connection.downlink || 10;
        const rtt = connection.rtt || 50;

        setConnectionDetails({ effectiveType, downlink, rtt });
        // Flag 2g, slow-2g or high RTT as low connectivity
        const isSlow = effectiveType === '2g' || effectiveType === 'slow-2g' || (downlink < 1.0 && downlink > 0);
        setIsLowConnection(isSlow);
      };

      updateConnection();
      connection.addEventListener('change', updateConnection);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', updateConnection);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isLowConnection, connectionDetails };
}
