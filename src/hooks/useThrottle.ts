import { useCallback, useRef } from 'react';

/**
 * Custom hook to throttle expensive function execution
 * 
 * @param fn The callback function to execute
 * @param delay Throttle period in milliseconds
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 800
): T => {
  const lastRun = useRef<number>(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      lastRun.current = now;
      return fn(...args);
    }
  }, [fn, delay]) as T;
};
