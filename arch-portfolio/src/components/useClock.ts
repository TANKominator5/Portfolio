'use client';

import { useEffect, useState } from 'react';

// Update only when the displayed value can change; suspend hidden/inactive clocks.
export function useClock(precision: 'second' | 'minute' | 'day', active = true) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      clearTimeout(timer);
      if (document.hidden) return;
      const date = new Date();
      setNow(date);
      const midnight = new Date(date);
      midnight.setHours(24, 0, 0, 0);
      const interval = precision === 'second' ? 1000 : 60000;
      const delay = precision === 'day' ? midnight.getTime() - date.getTime() : interval - date.getTime() % interval;
      timer = setTimeout(update, delay);
    };
    update();
    document.addEventListener('visibilitychange', update);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [precision, active]);
  return now;
}
