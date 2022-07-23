export const retry = async <T>(
  callback: () => Promise<T>,
  times: number,
  options: {
    onRetry?: (retryTimes: number) => void
  } = {},
  rawRetryTimes: number = times,
): Promise<T> => {
  const { onRetry } = options

  if (times < 0) {
    throw new Error('times must be greater than or equal 0')
  }

  if (Math.round(times) !== times) {
    throw new Error('times must be an integer')
  }

  try {
    const result = await callback()
    return result
  } catch (err) {
    if (times >= 1) {
      times--
      onRetry?.(rawRetryTimes - times)
      return retry(callback, times, options, rawRetryTimes)
    }
    return Promise.reject(err)
  }
}
