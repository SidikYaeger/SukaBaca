import { useState, useEffect } from 'react';

export function useAnimatedPresence(isOpen, exitDurationMs = 220) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsExiting(false);
    } else if (isMounted) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsMounted(false);
        setIsExiting(false);
      }, exitDurationMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, exitDurationMs, isMounted]);

  return { isMounted, isExiting };
}

export default useAnimatedPresence;
