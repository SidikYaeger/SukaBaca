import { useState, useEffect } from 'react';

export function useStaggeredReveal(items, delay = 0) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return revealed;
}

export function cardRevealClass(index, maxStagger = 10) {
  const n = Math.min(index + 1, maxStagger);
  return `card-reveal card-reveal-${n}`;
}
