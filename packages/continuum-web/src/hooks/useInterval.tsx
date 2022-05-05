import { useEffect, useRef } from 'react';

export const useInterval = (callback: () => any, delay) => {
  const callbackRef = useRef<() => any>();

  // update callback function with current render callback that has access to latest props and state
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!delay) {
      return () => {};
    }

    const interval = setInterval(() => {
      if (callbackRef.current) {
        callbackRef.current();
      }
    }, delay);
    return () => clearInterval(interval);
  }, [delay]);
};
