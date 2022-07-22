export const limit = async (callbacks: (() => Promise<unknown>)[], concurrency: number) => {
  if (concurrency < 1) {
    throw new Error('concurrency must be greater than 0')
  }

  if (Math.round(concurrency) !== concurrency) {
    throw new Error('concurrency must be an integer')
  }

  const res: Promise<unknown>[] = []
  const executing: Promise<unknown>[] = []
  const shouldLimit = callbacks.length > concurrency

  for (const callback of callbacks) {
    if (shouldLimit) {
      if (executing.length >= concurrency) {
        await Promise.race(executing)
      }
      const p = Promise.resolve().then(() => callback())
      res.push(p)
      executing.push(p)
      p.then(() => executing.splice(executing.indexOf(p), 1))
    } else {
      const p = Promise.resolve().then(() => callback())
      res.push(p)
    }
  }

  return Promise.all(res)
}
