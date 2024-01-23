/**
 * Merge keys of U into T, overriding value types with those in U.
 */
export type Override<T, U extends Partial<Record<keyof T, unknown>>> = FinalType<Omit<T, keyof U> & U>;

/**
 * Make a type assembled from several types/utilities more readable.
 * (e.g. the type will be shown as the final resulting type instead of as a bunch of type utils wrapping the initial type).
 */
export type FinalType<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
