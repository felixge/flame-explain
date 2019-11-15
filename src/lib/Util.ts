export type OptionalEmbed<T, Fragment> = T | (T & Fragment);

export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
