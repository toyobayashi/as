import type { BuildTarget } from './BuildTarget'
import type { BuildType } from './BuildType'
import { ClassIDType } from './ClassIDType'
import { EndianBinaryReader } from './EndianBinaryReader'
import type { ObjectInfo } from './ObjectInfo'
import type { SerializedFile } from './SerializedFile'
import type { SerializedType } from './SerializedType'

export class ObjectReader extends EndianBinaryReader {
  public assetsFile: SerializedFile
  public /* long */ m_PathID: bigint
  public /* long */ byteStart: bigint
  public /* uint */ byteSize: number
  public classIDType: ClassIDType
  public serializedType: SerializedType | null
  public platform: BuildTarget
  public /* uint */ m_Version: number

  public get version (): number[] { return this.assetsFile.version }
  public get buildType (): BuildType | null { return this.assetsFile.buildType }

  public constructor (reader: EndianBinaryReader, assetsFile: SerializedFile, objectInfo: ObjectInfo) {
    super((reader as any)._stream ?? (reader as any)._buffer)
    this.endian = reader.endian
    this.assetsFile = assetsFile
    this.m_PathID = objectInfo.m_PathID
    this.byteStart = objectInfo.byteStart
    this.byteSize = objectInfo.byteSize
    if (ClassIDType[objectInfo.classID] != null) {
      this.classIDType = objectInfo.classID
    } else {
      this.classIDType = ClassIDType.UnknownType
    }
    this.serializedType = objectInfo.serializedType
    this.platform = assetsFile.m_TargetPlatform
    this.m_Version = assetsFile.header.m_Version
  }

  public reset (): void {
    this.pos = Number(this.byteStart)
  }
}
