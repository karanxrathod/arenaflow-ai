import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce rapid values (like search inputs)
 * 
 * @param value The value to be debounced
 * @param delay Time delay in milliseconds
 */
export const useDebounce = <T>(value: T, delay: number = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
