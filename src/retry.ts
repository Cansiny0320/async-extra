export const retry = async <T>(callback: () => Promise<T>, times: number): Promise<T> => {
  if (times < 1) {
    throw new Error('times must be greater than 0')
  }

  if (Math.round(times) !== times) {
    throw new Error('times must be an integer')
  }

  try {
    const result = await callback()
    return result
  } catch (err) {
    if (times-- > 1) {
      return retry(callback, times)
    }
    return Promise.reject(err)
  }
}
