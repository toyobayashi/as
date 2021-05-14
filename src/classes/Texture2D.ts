import type { ObjectReader } from '../ObjectReader'
import { ResourceReader } from '../ResourceReader'
import { Texture } from './Texture'

export enum TextureFormat {
  Alpha8 = 1,
  ARGB4444,
  RGB24,
  RGBA32,
  ARGB32,
  RGB565 = 7,
  R16 = 9,
  DXT1,
  DXT5 = 12,
  RGBA4444,
  BGRA32,
  RHalf,
  RGHalf,
  RGBAHalf,
  RFloat,
  RGFloat,
  RGBAFloat,
  YUY2,
  RGB9e5Float,
  BC4 = 26,
  BC5,
  BC6H = 24,
  BC7,
  DXT1Crunched = 28,
  DXT5Crunched,
  PVRTC_RGB2,
  PVRTC_RGBA2,
  PVRTC_RGB4,
  PVRTC_RGBA4,
  ETC_RGB4,
  ATC_RGB4,
  ATC_RGBA8,
  EAC_R = 41,
  EAC_R_SIGNED,
  EAC_RG,
  EAC_RG_SIGNED,
  ETC2_RGB,
  ETC2_RGBA1,
  ETC2_RGBA8,
  ASTC_RGB_4x4,
  ASTC_RGB_5x5,
  ASTC_RGB_6x6,
  ASTC_RGB_8x8,
  ASTC_RGB_10x10,
  ASTC_RGB_12x12,
  ASTC_RGBA_4x4,
  ASTC_RGBA_5x5,
  ASTC_RGBA_6x6,
  ASTC_RGBA_8x8,
  ASTC_RGBA_10x10,
  ASTC_RGBA_12x12,
  ETC_RGB4_3DS,
  ETC_RGBA8_3DS,
  RG16,
  R8,
  ETC_RGB4Crunched,
  ETC2_RGBA8Crunched,
  ASTC_HDR_4x4,
  ASTC_HDR_5x5,
  ASTC_HDR_6x6,
  ASTC_HDR_8x8,
  ASTC_HDR_10x10,
  ASTC_HDR_12x12,
  RG32,
  RGB48,
  RGBA64
}

class StreamingInfo {
  public /* ulong */ offset: bigint
  public /* uint */ size: number
  public path: string

  public constructor (reader: ObjectReader) {
    const version = reader.version

    if (version[0] >= 2020) { // 2020.1 and up
      this.offset = reader.readBigUInt64()
    } else {
      this.offset = BigInt(reader.readUInt32())
    }
    this.size = reader.readUInt32()
    this.path = reader.readAlignedString()
  }
}

class GLTextureSettings {
  public /* int */ m_FilterMode: number
  public /* int */ m_Aniso: number
  public /* float */ m_MipBias: number
  public /* int */ m_WrapMode: number

  public constructor (reader: ObjectReader) {
    const version = reader.version

    this.m_FilterMode = reader.readInt32()
    this.m_Aniso = reader.readInt32()
    this.m_MipBias = reader.readFloat()
    if (version[0] >= 2017) { // 2017.x and up
      this.m_WrapMode = reader.readInt32() // m_WrapU
      /* int m_WrapV = */ reader.readInt32()
      /* int m_WrapW = */ reader.readInt32()
    } else {
      this.m_WrapMode = reader.readInt32()
    }
  }
}

export class Texture2D extends Texture {
  public /* int */ m_Width: number
  public /* int */ m_Height: number
  public m_TextureFormat: TextureFormat
  public m_MipMap?: boolean
  public /* int */ m_MipCount?: number
  public m_TextureSettings: GLTextureSettings
  public image_data: ResourceReader
  public m_StreamData?: StreamingInfo

  public constructor (reader: ObjectReader) {
    super(reader)
    this.m_Width = reader.readInt32()
    this.m_Height = reader.readInt32()
    /* const m_CompleteImageSize = */ reader.readInt32()
    if (this.version[0] >= 2020) { // 2020.1 and up
      /* const m_MipsStripped = */ reader.readInt32()
    }
    this.m_TextureFormat = reader.readInt32()
    if (this.version[0] < 5 || (this.version[0] === 5 && this.version[1] < 2)) { // 5.2 down
      this.m_MipMap = reader.readBoolean()
    } else {
      this.m_MipCount = reader.readInt32()
    }
    if (this.version[0] > 2 || (this.version[0] === 2 && this.version[1] >= 6)) { // 2.6.0 and up
      /* var m_IsReadable = */ reader.readBoolean()
    }
    if (this.version[0] >= 2020) { // 2020.1 and up
      /* var m_IsPreProcessed = */ reader.readBoolean()
    }
    if (this.version[0] > 2019 || (this.version[0] === 2019 && this.version[1] >= 3)) { // 2019.3 and up
      /* var m_IgnoreMasterTextureLimit = */ reader.readBoolean()
    }
    if (this.version[0] >= 3) { // 3.0.0 - 5.4
      if (this.version[0] < 5 || (this.version[0] === 5 && this.version[1] <= 4)) {
        /* var m_ReadAllowed = */ reader.readBoolean()
      }
    }
    if (this.version[0] > 2018 || (this.version[0] === 2018 && this.version[1] >= 2)) { // 2018.2 and up
      /* var m_StreamingMipmaps = */ reader.readBoolean()
    }
    reader.alignStream()
    if (this.version[0] > 2018 || (this.version[0] === 2018 && this.version[1] >= 2)) { // 2018.2 and up
      /* var m_StreamingMipmapsPriority = */ reader.readInt32()
    }
    /* const m_ImageCount = */ reader.readInt32()
    /* const m_TextureDimension = */ reader.readInt32()
    this.m_TextureSettings = new GLTextureSettings(reader)
    if (this.version[0] >= 3) { // 3.0 and up
      /* var m_LightmapFormat = */ reader.readInt32()
    }
    if (this.version[0] > 3 || (this.version[0] === 3 && this.version[1] >= 5)) { // 3.5.0 and up
      /* var m_ColorSpace = */ reader.readInt32()
    }
    if (this.version[0] > 2020 || (this.version[0] === 2020 && this.version[1] >= 2)) { // 2020.2 and up
      /* var m_PlatformBlob = */ reader.readUInt8Array()
      reader.alignStream()
    }
    const image_data_size = reader.readInt32()
    if (image_data_size === 0 && ((this.version[0] === 5 && this.version[1] >= 3) || this.version[0] > 5)) { // 5.3.0 and up
      this.m_StreamData = new StreamingInfo(reader)
    }

    let resourceReader: ResourceReader
    if (this.m_StreamData?.path) {
      resourceReader = new ResourceReader(this.m_StreamData.path, this.assetsFile, this.m_StreamData.offset, this.m_StreamData.size)
    } else {
      resourceReader = new ResourceReader(reader, BigInt(reader.pos), image_data_size)
    }
    this.image_data = resourceReader
  }
}
