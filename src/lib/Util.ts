export type OptionalEmbed<T, Fragment> = T | (T & Fragment);

export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}

// TODO(fg) test cases!
export function formatDuration(ms: number): string {
  const abs = Math.abs(ms),
    sign = ms < 0 ? '-' : '',
    msec = 1,
    sec = 1000 * msec,
    min = 60 * sec,
    usec = msec / 1000;

  if (abs > min) {
    return sign + (abs / min).toFixed(1) + ' m';
  } else if (abs > sec) {
    return sign + (abs / sec).toFixed(1) + ' s';
  } else if (abs > msec) {
    return sign + (abs / msec).toFixed(1) + ' ms';
  } else {
    return sign + (abs / usec).toFixed(0) + ' μs';
  }
}
