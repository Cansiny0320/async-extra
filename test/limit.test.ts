import { performance } from 'perf_hooks'
import { describe, expect, it } from 'vitest'
import { limit } from '../src/limit'

const promise = new Array(2).fill(0).map(
  (_, index) => () =>
    new Promise(resolve =>
      setTimeout(() => {
        resolve(index)
      }, 100),
    ),
)

describe('limit', () => {
  it('promise should be limit', async () => {
    const t = performance.now()
    await limit(promise, 1)
    expect(performance.now() - t).toBeGreaterThanOrEqual(200)
  })

  it('should throw error', async () => {
    limit([], 0).catch(err => {
      expect(err.message).toBe('concurrency must be greater than 0')
    })

    limit([], 1.1).catch(err => {
      expect(err.message).toBe('concurrency must be an integer')
    })
  })
})
