import { readSync, writeSync, fstatSync, closeSync } from 'fs'
import { IDisposable } from './IDisposable'

/** @public */
export abstract class Stream implements IDisposable {
  public length: number = -1
  public pos: number = 0

  public abstract read (buf: Buffer, bufOffset?: number, count?: number): void
  public abstract write (buf: Buffer, bufOffset?: number, count?: number): void
  public abstract dispose (): void
}

/** @public */
export class FileStream extends Stream {
  protected _disposed: boolean = false

  public constructor (public fd: number, public path: string, size: number) {
    super()
    this.length = size
  }

  public read (buf: Buffer, bufOffset: number = 0, count: number = buf.length): void {
    if (count <= 0) return
    readSync(this.fd, buf, bufOffset, count, this.pos)
    this.pos += count
  }

  public write (buf: Buffer, bufOffset: number = 0, count: number = buf.length): void {
    if (count <= 0) return
    writeSync(this.fd, buf, bufOffset, count, this.pos)
    this.pos += count
    this.length = fstatSync(this.fd).size
  }

  public dispose (): void {
    if (this._disposed) return
    try {
      closeSync(this.fd)
    } catch (_) {}
    this._disposed = true
  }
}

/** @public */
export class MemoryStream extends Stream {
  public buffer: Buffer

  public constructor (size: number) {
    super()
    this.buffer = Buffer.alloc(size)
    this.length = size
  }

  public read (buf: Buffer, bufOffset: number = 0, count: number = buf.length): void {
    if (count <= 0) return
    this.buffer.copy(buf, bufOffset, this.pos, this.pos + count)
    this.pos += count
  }

  public write (buf: Buffer, bufOffset: number = 0, count: number = buf.length): void {
    if (count <= 0) return
    if ((this.pos + count) > this.length) {
      throw new RangeError('MemoryStream write out of range')
    }
    buf.copy(this.buffer, this.pos, bufOffset, bufOffset + count)
    this.pos += count
  }

  public dispose (): void {
    if (this.buffer == null) return
    this.buffer = null!
  }
}
