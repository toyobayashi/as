import { BinaryReader, FileDescriptor } from '@tybys/binreader'
import { Stream, FileStream, MemoryStream } from './util/Stream'

/** @public */
export class EndianBinaryReader extends BinaryReader {
  public constructor (buffer: string | Uint8Array | Stream) {
    if (buffer instanceof Stream) {
      if (buffer instanceof FileStream) {
        super(new FileDescriptor(buffer.fd, buffer.length, buffer.path))
      } else if (buffer instanceof MemoryStream) {
        super(buffer.buffer)
      } else {
        throw new Error('This should not happen')
      }
    } else {
      super(buffer)
    }
  }

  readStringToNull (maxLength = 32767): string {
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

  alignStream (alignment: number): void {
    const pos = this.tell()
    const mod = pos % alignment
    if (mod !== 0) {
      this.pos += alignment - mod
    }
  }
}
