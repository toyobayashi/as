import type { ObjectReader } from '../ObjectReader'
import { ResourceReader } from '../ResourceReader'
import { NamedObject } from './NamedObject'

export enum AudioType {
  UNKNOWN,
  ACC,
  AIFF,
  IT = 10,
  MOD = 12,
  MPEG,
  OGGVORBIS,
  S3M = 17,
  WAV = 20,
  XM,
  XMA,
  VAG,
  AUDIOQUEUE
}

export enum AudioCompressionFormat {
  PCM,
  Vorbis,
  ADPCM,
  MP3,
  VAG,
  HEVAG,
  XMA,
  AAC,
  GCADPCM,
  ATRAC9
}

/** @public */
export class AudioClip extends NamedObject {
  public /* int */ m_Format: number = 0
  public m_Type: AudioType | null = null
  public m_3D: boolean = false
  public m_UseHardware: boolean = false

  // version 5
  public /* int */ m_LoadType: number = 0
  public /* int */ m_Channels: number = 0
  public /* int */ m_Frequency: number = 0
  public /* int */ m_BitsPerSample: number = 0
  public /* float */ m_Length: number = 0
  public m_IsTrackerFormat: boolean = false
  public /* int */ m_SubsoundIndex: number = 0
  public m_PreloadAudioData: boolean = false
  public m_LoadInBackground: boolean = false
  public m_Legacy3D: boolean = false
  public m_CompressionFormat: AudioCompressionFormat | null = null

  public m_Source: string | null = null
  public /* ulong */ m_Offset: bigint = BigInt(0)
  public /* long */ m_Size: bigint = BigInt(0)
  public m_AudioData: ResourceReader

  public constructor (reader: ObjectReader) {
    super(reader)
    if (this.version[0] < 5) {
      this.m_Format = reader.readInt32()
      this.m_Type = reader.readInt32()
      this.m_3D = reader.readBoolean()
      this.m_UseHardware = reader.readBoolean()
      reader.alignStream()

      if (this.version[0] >= 4 || (this.version[0] === 3 && this.version[1] >= 2)) { // 3.2.0 to 5
        /* const m_Stream = */ reader.readInt32()
        this.m_Size = BigInt(reader.readInt32())
        const tsize = this.m_Size % BigInt(4) !== BigInt(0) ? this.m_Size + BigInt(4) - this.m_Size % BigInt(4) : this.m_Size
        if ((BigInt(reader.byteSize) + reader.byteStart - BigInt(reader.pos)) !== tsize) {
          this.m_Offset = BigInt(reader.readUInt32())
          this.m_Source = this.assetsFile.fullName + '.resS'
        }
      } else {
        this.m_Size = BigInt(reader.readInt32())
      }
    } else {
      this.m_LoadType = reader.readInt32()
      this.m_Channels = reader.readInt32()
      this.m_Frequency = reader.readInt32()
      this.m_BitsPerSample = reader.readInt32()
      this.m_Length = reader.readFloat()
      this.m_IsTrackerFormat = reader.readBoolean()
      reader.alignStream()
      this.m_SubsoundIndex = reader.readInt32()
      this.m_PreloadAudioData = reader.readBoolean()
      this.m_LoadInBackground = reader.readBoolean()
      this.m_Legacy3D = reader.readBoolean()
      reader.alignStream()

      // StreamedResource m_Resource
      this.m_Source = reader.readAlignedString()
      this.m_Offset = reader.readBigUInt64()
      this.m_Size = reader.readBigInt64()
      this.m_CompressionFormat = reader.readInt32()
    }

    let resourceReader: ResourceReader
    if (this.m_Source) {
      resourceReader = new ResourceReader(this.m_Source, this.assetsFile, this.m_Offset, Number(this.m_Size))
    } else {
      resourceReader = new ResourceReader(reader, BigInt(reader.pos), Number(this.m_Size))
    }
    this.m_AudioData = resourceReader
  }
}
