export type OptionalEmbed<T, Fragment> = T | (T & Fragment)

// Disjoint returns T1 & T2, or never if the two types share one or more
// fields. Inspired by:
// https://spin.atomicobject.com/2019/03/25/disjoint-unions-typescript-conditional-types/
export type Disjoint<T1, T2> = Extract<keyof T1, keyof T2> extends never ? T1 & T2 : never

// See https://stackoverflow.com/a/50900933
type AllowedFieldsWithType<Obj, Type> = {
    [K in keyof Obj]: Obj[K] extends Type ? K : never
}

export type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Required<Obj>, Type>[keyof Obj]

export function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        throw new Error(msg)
    }
}

// TODO(fg) test cases!
export function formatDuration(ms: number): string {
    const abs = Math.abs(ms),
        sign = ms < 0 ? "-" : "",
        msec = 1,
        sec = 1000 * msec,
        min = 60 * sec,
        usec = msec / 1000,
        nsec = usec / 1000

    if (abs > min) {
        return sign + (abs / min).toFixed(1) + " m"
    } else if (abs > sec) {
        return sign + (abs / sec).toFixed(1) + " s"
    } else if (abs > msec) {
        return sign + (abs / msec).toFixed(1) + " ms"
    } else if (abs > usec) {
        return sign + (abs / usec).toFixed(0) + " μs"
    } else {
        return sign + (abs / nsec).toFixed(0) + " ns"
    }
}

export function formatPercent(f: number): string {
    return isNaN(f) ? "-" : (f * 100).toFixed(2) + "%"
}
