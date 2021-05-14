import { BinaryReader, FileDescriptor } from '@tybys/binreader'
import { Stream, FileStream, MemoryStream } from './util/Stream'

/** @public */
export class EndianBinaryReader extends BinaryReader {
  protected _stream: Stream | null

  public constructor (buffer: string | Uint8Array | Stream) {
    if (buffer instanceof Stream) {
      if (buffer instanceof FileStream) {
        super(new FileDescriptor(buffer.fd, buffer.length, buffer.path))
      } else if (buffer instanceof MemoryStream) {
        super(buffer.buffer)
      } else {
        throw new Error('This should not happen')
      }
      this._stream = buffer
    } else {
      super(buffer)
      this._stream = null
    }
  }

  public readStringToNull (maxLength = 32767): string {
    const bytes: number[] = []
    let count = 0
    while (this.tell() !== this.size && count < maxLength) {
      const b = this.readUInt8()
      if (b === 0) {
        break
      }
      bytes.push(b)
      count++
    }
    return Buffer.from(bytes).toString()
  }

  public alignStream (alignment: number = 4): void {
    const pos = this.tell()
    const mod = pos % alignment
    if (mod !== 0) {
      this.pos += alignment - mod
    }
  }

  private static readArray<T> (del: (...args: any[]) => T, length: number): T[] {
    const array = Array(length)
    for (let i = 0; i < length; i++) {
      array[i] = del()
    }
    return array
  }

  public readInt32Array (length?: number): number[] {
    if (length == null) {
      length = this.readInt32()
    }
    return EndianBinaryReader.readArray(this.readInt32.bind(this), length)
  }

  public readAlignedString (): string {
    const length = this.readInt32()
    if (length > 0 && length <= this.size - this.pos) {
      const stringData = Buffer.from(this.read(length))
      const result = stringData.toString('utf8')
      this.alignStream(4)
      return result
    }
    return ''
  }

  public readUInt8Array (): Buffer {
    return Buffer.from(this.read(this.readInt32()))
  }
}
