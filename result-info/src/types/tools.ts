export type Prettier<T> = T extends object
  ? T extends infer O ? { [K in keyof O]: Prettier<O[K]> } : never
  : T;