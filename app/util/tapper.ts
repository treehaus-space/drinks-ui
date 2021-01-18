export const createTapper = (
  {
    pattern = Patterns.wedding,
    tolerance = 0.8,
    resetTimeout = 3000,
  }: { pattern: number[]; tolerance: number; resetTimeout?: number },
  callback: { (): void; (): void }
) => {
  let count = 0;
  let times: Date[] = [];
  let beat: number = null;
  let timeout: number;
  let intervall: number;

  const secondBeatIndex = pattern.findIndex((hit, index) => index > 0 && hit);

  const reset = () => {
    count = 0;
    times = [];
    beat = null;
    clearTimeout(timeout);
    clearInterval(intervall);
    console.log('reset');
  };

  const prolongTimeout = () => {
    clearTimeout(timeout);
    timeout = window.setTimeout(reset, beat ? beat * 12 : resetTimeout);
  };

  const isTimeNearBeat = (time: { getTime: () => number }, beatTime: Date, hit: number) => {
    const error = beatTime.getTime() - time.getTime();
    // at tolerance >= 1, hitting pauses won't matter anymore and you can be off by one full beat.
    const allowedError = (beat + (hit ? tolerance * beat : -tolerance * beat)) * 0.5;
    return Math.abs(error) < allowedError;
  };

  const checkTimes = () =>
    pattern.every((hit, step) => {
      const beatTime = new Date(Math.round(times[0].getTime() + beat * step));

      if (hit) {
        return times.some((time) => isTimeNearBeat(time, beatTime, hit));
      }

      return !times.some((time) => isTimeNearBeat(time, beatTime, hit));
    });

  return () => {
    times[count] = new Date();
    count++;

    console.log(count, Number(times[count - 1]) - Number(times[0]));

    if (count === 2) {
      beat = Math.round((Number(times[1]) - Number(times[0])) / secondBeatIndex);
    }

    if (count === pattern.filter((hit) => hit).length) {
      if (checkTimes()) {
        const stepsTillEnd = pattern.length - pattern.lastIndexOf(1);
        setTimeout(() => {
          callback();
          reset();
        }, beat * stepsTillEnd);
      } else {
        console.log('Better luck next time!');
        reset();
      }
    }

    prolongTimeout();
  };
};

// prettier-ignore
export const Patterns = {
  debug: [
    1, 0, 1, 0,
    1, 0, 1, 0,
    1, 0, 1, 0,
    1, 0, 1, 0
  ],
  wedding: [ 
    1, 0, 0, 0,
    1, 0, 0, 1,
    1, 0, 0, 0,
    0, 0, 0, 0,
    1, 0, 0, 0,
    1, 0, 0, 1,
    1, 0, 0, 0,
    0, 0, 0, 0,
  ],
  imperial: [
    1, 0, 0, 0,
    1, 0, 0, 0,
    1, 0, 0, 0,
    1, 0, 0, 1,
    1, 0, 0, 0,
    1, 0, 0, 1,
    1, 0, 0, 0
  ],
};
