import type { BinaryReader } from '@tybys/binreader'
import type { AssetsManager } from './AssetsManager'
import type { EndianBinaryReader } from './EndianBinaryReader'

/** @public */
export class SerializedFileHeader {
  public /* uint */ m_MetadataSize: number = 0
  public /* long */ m_FileSize: bigint = BigInt(0)
  public /* uint */ m_Version: number = 0
  public /* long */ m_DataOffset: bigint = BigInt(0)
  public /* byte */ m_Endianess: number = 0
  public /* byte[] */ m_Reserved: number[] = []
}

/** @public */
export class BuildType {
  public constructor (private readonly buildType: string) {}

  public isAlpha (): boolean { return this.buildType === 'a' }
  public isPatch (): boolean { return this.buildType === 'p' }
}

/** @public */
export class SerializedFile {
  public originalPath: string = ''
  public fileName: string = ''
  public unityVersion: string = '2.5.0f5'
  public buildType!: BuildType
  public version: number[] = [0, 0, 0, 0]
  public header: SerializedFileHeader = new SerializedFileHeader()

  public constructor (_assetsManager: AssetsManager, _fullName: string, _reader: EndianBinaryReader) {
    // TODO
    console.log('TODO')
  }

  public setVersion (stringVersion: string): void {
    this.unityVersion = stringVersion
    const buildSplit = stringVersion.replace(/\d/g, '').split('.').filter(s => !!s)
    this.buildType = new BuildType(buildSplit[0])
    const versionSplit = stringVersion.replace(/\D/g, '.').split('.')
    this.version = versionSplit.map((v) => parseInt(v))
  }

  public static isSerializedFile (reader: BinaryReader): boolean {
    const fileSize = reader.size
    if (fileSize < 20) {
      return false
    }
    /* let m_MetadataSize = */ reader.readUInt32()
    let m_FileSize: number | bigint = reader.readUInt32()
    const m_Version = reader.readUInt32()
    let m_DataOffset: number | bigint = reader.readUInt32()
    /* const m_Endianess = */ reader.read()/* [0] */
    /* const m_Reserved = */ reader.read(3)
    if (m_Version >= 22) {
      if (fileSize < 48) {
        return false
      }
      /* m_MetadataSize = */ reader.readUInt32()
      m_FileSize = reader.readBigInt64()
      m_DataOffset = reader.readBigInt64()
    }
    if (BigInt(m_FileSize) !== BigInt(fileSize)) {
      reader.seek(0)
      return false
    }
    if (m_DataOffset > fileSize) {
      reader.seek(0)
      return false
    }
    reader.seek(0)
    return true
  }
}
