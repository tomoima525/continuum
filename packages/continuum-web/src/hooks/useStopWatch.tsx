import { useState } from 'react';
import { useInterval } from './useInterval';

const getSecondsFromPrevTime = (prevTime: number) => {
  const now = new Date().getTime();
  const milliSecondsDistance = now - prevTime;
  if (milliSecondsDistance > 0) {
    const val = milliSecondsDistance / 1000;
    return Math.round(val);
  }
  return 0;
};

export const useStopWatch = () => {
  const [passedSeconds, setPassedSeconds] = useState(0);
  const [prevTime, setPrevTime] = useState(new Date());
  const [seconds, setSeconds] = useState(
    passedSeconds + getSecondsFromPrevTime(prevTime.getTime() || 0),
  );
  const [isRunning, setIsRunning] = useState(false);

  useInterval(
    () => {
      setSeconds(passedSeconds + getSecondsFromPrevTime(prevTime.getTime()));
    },
    isRunning ? 1000 : null,
  );

  function start() {
    const newPrevTime = new Date();
    setPrevTime(newPrevTime);
    setIsRunning(true);
    setSeconds(passedSeconds + getSecondsFromPrevTime(newPrevTime.getTime()));
  }

  function pause() {
    setPassedSeconds(seconds);
    setIsRunning(false);
  }

  function reset() {
    const newPassedSeconds = 0;
    const newPrevTime = new Date();
    setPrevTime(newPrevTime);
    setPassedSeconds(newPassedSeconds);
    setIsRunning(false);
    setSeconds(
      newPassedSeconds + getSecondsFromPrevTime(newPrevTime.getTime()),
    );
  }

  return {
    seconds,
    start,
    pause,
    reset,
  };
};
