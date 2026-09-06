import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles } from 'lucide-react';

export function DynamicGreeting() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // 5:00 AM (300m) to 11:59 AM (719m)
    if (totalMinutes >= 300 && totalMinutes < 720) {
      return { text: 'GOOD MORNING, EXPLORER', icon: '🌅', period: 'Morning' };
    }
    // 12:00 PM (720m) to 4:59 PM (1019m)
    if (totalMinutes >= 720 && totalMinutes < 1020) {
      return { text: 'GOOD AFTERNOON, EXPLORER', icon: '☀️', period: 'Afternoon' };
    }
    // 5:00 PM (1020m) to 11:59 PM (1439m)
    if (totalMinutes >= 1020 && totalMinutes <= 1439) {
      return { text: 'GOOD EVENING, EXPLORER', icon: '🌆', period: 'Evening' };
    }
    // 12:00 AM (0m) to 4:59 AM (299m)
    return { text: 'GOOD NIGHT, EXPLORER', icon: '🌙', period: 'Night' };
  };

  const greeting = getGreeting();

  // Format digital time
  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Format date
  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-xl" role="img" aria-label="Greeting Icon">
          {greeting.icon}
        </span>
        <h2 className="text-xs sm:text-sm font-extrabold tracking-widest text-cyan-300 uppercase">
          {greeting.text}
        </h2>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-cyan-300 font-mono font-bold shadow-cyan-glow">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{formattedTime}</span>
        </div>
      </div>
    </div>
  );
}

export default DynamicGreeting;