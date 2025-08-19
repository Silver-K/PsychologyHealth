export function promiseWithResolvers<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => {};
  let reject: <T>(reason: T) => void = () => {};
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  });
  return {
    promise,
    resolve,
    reject,
  }
}