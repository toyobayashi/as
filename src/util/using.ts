import { IDisposable } from './IDisposable'

export function using<D extends IDisposable, H extends (disposable: D) => any> (disposable: D, handler: H): ReturnType<H> {
  let r: ReturnType<H>
  try {
    r = handler(disposable)
  } catch (err) {
    disposable.dispose()
    throw err
  }
  disposable.dispose()
  return r
}

export async function usingAsync<D extends IDisposable, H extends (disposable: D) => any> (disposable: D, handler: H): Promise<ReturnType<H>> {
  let r: ReturnType<H>
  try {
    r = await Promise.resolve(handler(disposable))
  } catch (err) {
    disposable.dispose()
    throw err
  }
  disposable.dispose()
  return r
}
