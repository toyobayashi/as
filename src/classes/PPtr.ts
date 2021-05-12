import type { ObjectReader } from '../ObjectReader'
import type { SerializedFile } from '../SerializedFile'
import type { Object } from './Object'

export class PPtr<T extends Object> {
  public /* int */ m_FileID: number
  public /* long */ m_PathID: bigint

  private readonly assetsFile: SerializedFile
  private /* int */ readonly index = -2 // -2 - Prepare, -1 - Missing

  public constructor (reader: ObjectReader) {
    this.m_FileID = reader.readInt32()
    this.m_PathID = reader.m_Version < 14 ? BigInt(reader.readInt32()) : reader.readBigInt64()
    this.assetsFile = reader.assetsFile
  }

  public get isNull (): boolean {
    return this.m_PathID === BigInt(0) || this.m_FileID < 0
  }

  public set (_m_Object: T): void {
    // TODO
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.assetsFile; this.index
  }
}
