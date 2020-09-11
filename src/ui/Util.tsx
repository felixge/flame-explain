/**
 * setCancelable takes a set function as produced by useState() and returns
 * a wrapped version of it along with a cancel function that can be called
 * to ignore any future call to the set function, effectively canceling it.
 */
export function setCancelable<T>(set: SetFn<T>): [SetFn<T>, CancelFn] {
  let canceled = false;
  const setFn = (v: T) => {
    if (!canceled) {
      set(v);
    }
  };
  const cancelFn = () => {
    canceled = true;
  };
  return [setFn, cancelFn];
}

type SetFn<T> = (v: T) => void;
type CancelFn = () => void;

// normalizePlan deals with JSON plans produced by psql which have various
// text decoration elements that need to be removed, see GH issue for more
// details: https://github.com/felixge/flame-explain/issues/7
export function normalizePlan(plan: string): string {
  let cropped = plan.slice(plan.indexOf('['), plan.lastIndexOf(']') + 1);
  return cropped.replace(/\+/g, '');
}
