import { describe, expect, it, vi } from 'vitest'
import { retry } from '../src/index'

let retryTimes = 0

const resolveCallback = () => Promise.resolve(1)
const rejectCallback = () => Promise.reject(new Error('error'))
const randomCallback = () =>
  new Promise((resolve, reject) => {
    const random = Math.random()
    if (random > 0.5) {
      resolve(1)
    } else {
      retryTimes++
      reject(new Error('error'))
    }
  })
const callback = {
  resolveCallback,
  rejectCallback,
  randomCallback,
}

const resolveSpy = vi.spyOn(callback, 'resolveCallback')
const rejectSpy = vi.spyOn(callback, 'rejectCallback')
const randomSpy = vi.spyOn(callback, 'randomCallback')
describe('retry', () => {
  it('callback should not retry', async () => {
    const result = await retry(callback.resolveCallback, 3)
    expect(result).toBe(1)
    expect(resolveSpy).toBeCalledTimes(1)
  })

  it('callback should retry', async () => {
    try {
      await retry(callback.rejectCallback, 3)
    } catch (error: any) {
      expect(error.message).toBe('error')
      expect(rejectSpy).toBeCalledTimes(4)
    }

    try {
      await retry(callback.randomCallback, 3)
      expect(randomSpy).toBeCalledTimes(retryTimes + 1)
    } catch (error: any) {
      expect(randomSpy).toBeCalledTimes(4)
    }
  })

  it('should throw error', async () => {
    retry(resolveCallback, 0).catch(err => {
      expect(err.message).toBe('times must be greater than or equal 0')
    })

    retry(resolveCallback, 1.1).catch(err => {
      expect(err.message).toBe('times must be an integer')
    })
  })
  it('should return retry times', async () => {
    let times = 0
    try {
      await retry(callback.rejectCallback, 3, {
        onRetry: (_retryTimes: number) => {
          times = _retryTimes
        },
      })
    } catch {}
    expect(times).toBe(3)
  })
})
