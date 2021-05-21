import type { Texture2D } from '../classes/Texture2D'
import { TextureFormat } from '../classes/Texture2D'
import { BuildTarget } from '../BuildTarget'

import Jimp = require('jimp')

const TextureDecoder: {
  DecodeDXT1: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeDXT5: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeETC1: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeETC2: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeETC2A1: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeETC2A8: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeEACR: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeEACRSigned: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeEACRG: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeEACRGSigned: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeBC4: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeBC5: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeBC6: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeBC7: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeATCRGB4: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodeATCRGBA8: (data: Buffer, width: number, height: number, image: Buffer) => boolean
  DecodePVRTC: (data: Buffer, width: number, height: number, image: Buffer, is2bpp: boolean) => boolean
  DecodeASTC: (data: Buffer, width: number, height: number, blockWidth: number, blockHeight: number, image: Buffer) => boolean
  UnpackCrunch: (data: Buffer) => Buffer | null
  UnpackUnityCrunch: (data: Buffer) => Buffer | null
  DecodeRHalf: (image: Buffer, buff: Buffer) => void
  DecodeRGHalf: (image: Buffer, buff: Buffer) => void
  DecodeRGBAHalf: (image: Buffer, buff: Buffer) => void
} = require('../../../dist/decoder.node')

export class Texture2DConverter {
  private /* int */ readonly m_Width: number
  private /* int */ readonly m_Height: number
  private readonly m_TextureFormat: TextureFormat
  private /* int */ image_data_size: number
  private image_data: Buffer
  private readonly version: number[]
  private readonly platform: BuildTarget

  public constructor (m_Texture2D: Texture2D) {
    this.image_data = m_Texture2D.image_data.getData()
    this.image_data_size = this.image_data.length
    this.m_Width = m_Texture2D.m_Width
    this.m_Height = m_Texture2D.m_Height
    this.m_TextureFormat = m_Texture2D.m_TextureFormat
    this.version = m_Texture2D.version
    this.platform = m_Texture2D.platform
  }

  public convertToBitmap (flip: boolean): Jimp | null {
    if (this.image_data == null || this.image_data.length === 0) { return null }
    const buff = this.decodeTexture2D()
    if (buff == null) {
      return null
    }
    const bitmap = new Jimp(this.m_Width, this.m_Height)
    bgra8888(bitmap, buff, buff.length)

    if (flip) {
      bitmap.flip(false, true)
    }
    return bitmap
  }

  private decodeTexture2D (): Buffer | null {
    let bytes: Buffer | null = null
    switch (this.m_TextureFormat) {
      case TextureFormat.Alpha8: // test pass
        bytes = this.decodeAlpha8()
        break
      case TextureFormat.ARGB4444: // test pass
        this.swapBytesForXbox()
        bytes = this.decodeARGB4444()
        break
      case TextureFormat.RGB24: // test pass
        bytes = this.decodeRGB24()
        break
      case TextureFormat.RGBA32: // test pass
        bytes = this.decodeRGBA32()
        break
      case TextureFormat.ARGB32: // test pass
        bytes = this.decodeARGB32()
        break
      case TextureFormat.RGB565: // test pass
        this.swapBytesForXbox()
        bytes = this.decodeRGB565()
        break
      case TextureFormat.R16: // test pass
        bytes = this.decodeR16()
        break
      case TextureFormat.DXT1: // test pass
        this.swapBytesForXbox()
        bytes = this.decodeDXT1()
        break
      case TextureFormat.DXT5: // test pass
        this.swapBytesForXbox()
        bytes = this.decodeDXT5()
        break
      case TextureFormat.RGBA4444: // test pass
        bytes = this.decodeRGBA4444()
        break
      case TextureFormat.BGRA32: // test pass
        bytes = this.decodeBGRA32()
        break
      case TextureFormat.RHalf:
        bytes = this.decodeRHalf()
        break
      case TextureFormat.RGHalf:
        bytes = this.decodeRGHalf()
        break
      case TextureFormat.RGBAHalf: // test pass
        bytes = this.decodeRGBAHalf()
        break
      case TextureFormat.RFloat:
        bytes = this.decodeRFloat()
        break
      case TextureFormat.RGFloat:
        bytes = this.decodeRGFloat()
        break
      case TextureFormat.RGBAFloat:
        bytes = this.decodeRGBAFloat()
        break
      case TextureFormat.YUY2: // test pass
        bytes = this.decodeYUY2()
        break
      case TextureFormat.RGB9e5Float: // test pass
        bytes = this.decodeRGB9e5Float()
        break
      case TextureFormat.BC4: // test pass
        bytes = this.decodeBC4()
        break
      case TextureFormat.BC5: // test pass
        bytes = this.decodeBC5()
        break
      case TextureFormat.BC6H: // test pass
        bytes = this.decodeBC6H()
        break
      case TextureFormat.BC7: // test pass
        bytes = this.decodeBC7()
        break
      case TextureFormat.DXT1Crunched: // test pass
        if (this.unpackCrunch()) {
          bytes = this.decodeDXT1()
        }
        break
      case TextureFormat.DXT5Crunched: // test pass
        if (this.unpackCrunch()) {
          bytes = this.decodeDXT5()
        }
        break
      case TextureFormat.PVRTC_RGB2: // test pass
      case TextureFormat.PVRTC_RGBA2: // test pass
        bytes = this.decodePVRTC(true)
        break
      case TextureFormat.PVRTC_RGB4: // test pass
      case TextureFormat.PVRTC_RGBA4: // test pass
        bytes = this.decodePVRTC(false)
        break
      case TextureFormat.ETC_RGB4: // test pass
      case TextureFormat.ETC_RGB4_3DS:
        bytes = this.decodeETC1()
        break
      case TextureFormat.ATC_RGB4: // test pass
        bytes = this.decodeATCRGB4()
        break
      case TextureFormat.ATC_RGBA8: // test pass
        bytes = this.decodeATCRGBA8()
        break
      case TextureFormat.EAC_R: // test pass
        bytes = this.decodeEACR()
        break
      case TextureFormat.EAC_R_SIGNED:
        bytes = this.decodeEACRSigned()
        break
      case TextureFormat.EAC_RG: // test pass
        bytes = this.decodeEACRG()
        break
      case TextureFormat.EAC_RG_SIGNED:
        bytes = this.decodeEACRGSigned()
        break
      case TextureFormat.ETC2_RGB: // test pass
        bytes = this.decodeETC2()
        break
      case TextureFormat.ETC2_RGBA1: // test pass
        bytes = this.decodeETC2A1()
        break
      case TextureFormat.ETC2_RGBA8: // test pass
      case TextureFormat.ETC_RGBA8_3DS:
        bytes = this.decodeETC2A8()
        break
      case TextureFormat.ASTC_RGB_4x4: // test pass
      case TextureFormat.ASTC_RGBA_4x4: // test pass
      case TextureFormat.ASTC_HDR_4x4: // test pass
        bytes = this.decodeASTC(4)
        break
      case TextureFormat.ASTC_RGB_5x5: // test pass
      case TextureFormat.ASTC_RGBA_5x5: // test pass
      case TextureFormat.ASTC_HDR_5x5: // test pass
        bytes = this.decodeASTC(5)
        break
      case TextureFormat.ASTC_RGB_6x6: // test pass
      case TextureFormat.ASTC_RGBA_6x6: // test pass
      case TextureFormat.ASTC_HDR_6x6: // test pass
        bytes = this.decodeASTC(6)
        break
      case TextureFormat.ASTC_RGB_8x8: // test pass
      case TextureFormat.ASTC_RGBA_8x8: // test pass
      case TextureFormat.ASTC_HDR_8x8: // test pass
        bytes = this.decodeASTC(8)
        break
      case TextureFormat.ASTC_RGB_10x10: // test pass
      case TextureFormat.ASTC_RGBA_10x10: // test pass
      case TextureFormat.ASTC_HDR_10x10: // test pass
        bytes = this.decodeASTC(10)
        break
      case TextureFormat.ASTC_RGB_12x12: // test pass
      case TextureFormat.ASTC_RGBA_12x12: // test pass
      case TextureFormat.ASTC_HDR_12x12: // test pass
        bytes = this.decodeASTC(12)
        break
      case TextureFormat.RG16: // test pass
        bytes = this.decodeRG16()
        break
      case TextureFormat.R8: // test pass
        bytes = this.decodeR8()
        break
      case TextureFormat.ETC_RGB4Crunched: // test pass
        if (this.unpackCrunch()) {
          bytes = this.decodeETC1()
        }
        break
      case TextureFormat.ETC2_RGBA8Crunched: // test pass
        if (this.unpackCrunch()) {
          bytes = this.decodeETC2A8()
        }
        break
    }
    return bytes
  }

  private decodeRGFloat (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < buff.length; i += 4) {
      buff[i] = 0
      buff[i + 1] = Math.round(this.image_data.readFloatLE(i * 2 + 4) * 255) & 0xff
      buff[i + 2] = Math.round(this.image_data.readFloatLE(i * 2) * 255) & 0xff
      buff[i + 3] = 255
    }
    return buff
  }

  private decodeRGBAFloat (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < buff.length; i += 4) {
      buff[i] = Math.round(this.image_data.readFloatLE(i * 4 + 8) * 255) & 0xff
      buff[i + 1] = Math.round(this.image_data.readFloatLE(i * 4 + 4) * 255) & 0xff
      buff[i + 2] = Math.round(this.image_data.readFloatLE(i * 4) * 255) & 0xff
      buff[i + 3] = Math.round(this.image_data.readFloatLE(i * 4 + 12) * 255) & 0xff
    }
    return buff
  }

  private clampByte (x: number): number {
    return (x > 255 ? 255 : (x > 0 ? x : 0)) & 0xff
  }

  private decodeYUY2 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    let p = 0
    let o = 0
    const halfWidth = this.m_Width / 2
    for (let j = 0; j < this.m_Height; j++) {
      for (let i = 0; i < halfWidth; ++i) {
        const y0 = this.image_data[p++]
        const u0 = this.image_data[p++]
        const y1 = this.image_data[p++]
        const v0 = this.image_data[p++]
        let c = y0 - 16
        const d = u0 - 128
        const e = v0 - 128
        buff[o++] = this.clampByte((298 * c + 516 * d + 128) >> 8) // b
        buff[o++] = this.clampByte((298 * c - 100 * d - 208 * e + 128) >> 8) // g
        buff[o++] = this.clampByte((298 * c + 409 * e + 128) >> 8) // r
        buff[o++] = 255
        c = y1 - 16
        buff[o++] = this.clampByte((298 * c + 516 * d + 128) >> 8) // b
        buff[o++] = this.clampByte((298 * c - 100 * d - 208 * e + 128) >> 8) // g
        buff[o++] = this.clampByte((298 * c + 409 * e + 128) >> 8) // r
        buff[o++] = 255
      }
    }
    return buff
  }

  private decodeRGB9e5Float (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < buff.length; i += 4) {
      const n = this.image_data.readInt32LE(i)
      const scale = n >> 27 & 0x1f
      const scalef = Math.pow(2, scale - 24)
      const b = n >> 18 & 0x1ff
      const g = n >> 9 & 0x1ff
      const r = n & 0x1ff
      buff[i] = Math.round(b * scalef * 255) & 0xff
      buff[i + 1] = Math.round(g * scalef * 255) & 0xff
      buff[i + 2] = Math.round(r * scalef * 255) & 0xff
      buff[i + 3] = 255
    }
    return buff
  }

  private decodeBC4 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeBC4(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeBC5 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeBC5(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeBC6H (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeBC6(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeBC7 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeBC7(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private unpackCrunch (): boolean {
    let result: Buffer | null = null
    if (this.version[0] > 2017 || (this.version[0] === 2017 && this.version[1] >= 3) || // 2017.3 and up
                this.m_TextureFormat === TextureFormat.ETC_RGB4Crunched ||
                this.m_TextureFormat === TextureFormat.ETC2_RGBA8Crunched) {
      result = TextureDecoder.UnpackUnityCrunch(this.image_data)
    } else {
      result = TextureDecoder.UnpackCrunch(this.image_data)
    }
    if (result != null) {
      this.image_data = result
      this.image_data_size = result.length
      return true
    }
    return false
  }

  private decodePVRTC (is2bpp: boolean): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodePVRTC(this.image_data, this.m_Width, this.m_Height, buff, is2bpp)) {
      return null
    }
    return buff
  }

  private decodeETC1 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeETC1(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeATCRGB4 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeATCRGB4(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeATCRGBA8 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeATCRGBA8(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeEACR (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeEACR(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeEACRSigned (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeEACRSigned(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeEACRG (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeEACRG(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeEACRGSigned (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeEACRGSigned(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeETC2 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeETC2(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeETC2A1 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeETC2A1(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeETC2A8 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeETC2A8(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeASTC (blocksize: number): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeASTC(this.image_data, this.m_Width, this.m_Height, blocksize, blocksize, buff)) {
      return null
    }
    return buff
  }

  private decodeRG16 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < this.m_Width * this.m_Height; i += 2) {
      buff[i * 2 + 1] = this.image_data[i + 1]// G
      buff[i * 2 + 2] = this.image_data[i]// R
      buff[i * 2 + 3] = 255// A
    }
    return buff
  }

  private decodeR8 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < this.m_Width * this.m_Height; i++) {
      buff[i * 4 + 2] = this.image_data[i]// R
      buff[i * 4 + 3] = 255// A
    }
    return buff
  }

  private swapBytesForXbox (): void {
    if (this.platform === BuildTarget.XBOX360) {
      for (let i = 0; i < this.image_data_size / 2; i++) {
        const b = this.image_data[i * 2]
        this.image_data[i * 2] = this.image_data[i * 2 + 1]
        this.image_data[i * 2 + 1] = b
      }
    }
  }

  private decodeAlpha8 (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4).fill(0xFF)
    for (let i = 0; i < this.m_Width * this.m_Height; i++) {
      buff[i * 4 + 3] = this.image_data[i]
    }
    return buff
  }

  private decodeARGB4444 (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < this.m_Width * this.m_Height; i++) {
      const pixelNew = Buffer.alloc(4)
      const pixelOldShort = this.image_data.readUInt16LE(i * 2)
      pixelNew[0] = (pixelOldShort & 0x000f) & 0xff
      pixelNew[1] = ((pixelOldShort & 0x00f0) >> 4) & 0xff
      pixelNew[2] = ((pixelOldShort & 0x0f00) >> 8) & 0xff
      pixelNew[3] = ((pixelOldShort & 0xf000) >> 12) & 0xff
      for (let j = 0; j < 4; j++) { pixelNew[j] = ((pixelNew[j] << 4) | pixelNew[j]) & 0xff }
      pixelNew.copy(buff, i * 4)
    }
    return buff
  }

  private decodeRGB24 (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < this.m_Width * this.m_Height; i++) {
      buff[i * 4] = this.image_data[i * 3 + 2]
      buff[i * 4 + 1] = this.image_data[i * 3 + 1]
      buff[i * 4 + 2] = this.image_data[i * 3 + 0]
      buff[i * 4 + 3] = 255
    }
    return buff
  }

  private decodeRGBA32 (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < buff.length; i += 4) {
      buff[i] = this.image_data[i + 2]
      buff[i + 1] = this.image_data[i + 1]
      buff[i + 2] = this.image_data[i + 0]
      buff[i + 3] = this.image_data[i + 3]
    }
    return buff
  }

  private decodeARGB32 (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < buff.length; i += 4) {
      buff[i] = this.image_data[i + 3]
      buff[i + 1] = this.image_data[i + 2]
      buff[i + 2] = this.image_data[i + 1]
      buff[i + 3] = this.image_data[i + 0]
    }
    return buff
  }

  private decodeRGB565 (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < this.m_Width * this.m_Height; i++) {
      const p = this.image_data.readUInt16LE(i * 2)
      buff[i * 4] = ((p << 3) | (p >> 2 & 7)) & 0xff
      buff[i * 4 + 1] = ((p >> 3 & 0xfc) | (p >> 9 & 3)) & 0xff
      buff[i * 4 + 2] = ((p >> 8 & 0xf8) | (p >> 13)) & 0xff
      buff[i * 4 + 3] = 255
    }
    return buff
  }

  private decodeR16 (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < this.m_Width * this.m_Height; i++) {
      buff[i * 4 + 2] = this.image_data[i * 2 + 1] // r
      buff[i * 4 + 3] = 255 // a
    }
    return buff
  }

  private decodeDXT1 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeDXT1(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeDXT5 (): Buffer | null {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    if (!TextureDecoder.DecodeDXT5(this.image_data, this.m_Width, this.m_Height, buff)) {
      return null
    }
    return buff
  }

  private decodeRGBA4444 (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < this.m_Width * this.m_Height; i++) {
      const pixelNew = Buffer.alloc(4)
      const pixelOldShort = this.image_data.readUInt16LE(i * 2)
      pixelNew[0] = ((pixelOldShort & 0x00f0) >> 4) & 0xff
      pixelNew[1] = ((pixelOldShort & 0x0f00) >> 8) & 0xff
      pixelNew[2] = ((pixelOldShort & 0xf000) >> 12) & 0xff
      pixelNew[3] = (pixelOldShort & 0x000f) & 0xff
      for (let j = 0; j < 4; j++) { pixelNew[j] = ((pixelNew[j] << 4) | pixelNew[j]) & 0xff }
      pixelNew.copy(buff, i * 4)
    }
    return buff
  }

  private decodeBGRA32 (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < buff.length; i += 4) {
      buff[i] = this.image_data[i]
      buff[i + 1] = this.image_data[i + 1]
      buff[i + 2] = this.image_data[i + 2]
      buff[i + 3] = this.image_data[i + 3]
    }
    return buff
  }

  private decodeRHalf (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    TextureDecoder.DecodeRHalf(this.image_data, buff)
    return buff
  }

  private decodeRGHalf (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    TextureDecoder.DecodeRGHalf(this.image_data, buff)
    return buff
  }

  private decodeRGBAHalf (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    TextureDecoder.DecodeRGBAHalf(this.image_data, buff)
    return buff
  }

  private decodeRFloat (): Buffer {
    const buff = Buffer.alloc(this.m_Width * this.m_Height * 4)
    for (let i = 0; i < buff.length; i += 4) {
      buff[i] = 0
      buff[i + 1] = 0
      buff[i + 2] = Math.round(this.image_data.readFloatLE(i) * 255) & 0xff
      buff[i + 3] = 255
    }
    return buff
  }
}

function bgra8888 (img: Jimp, data: Buffer, length: number): void {
  let x = 0
  let y = 0
  const width = img.getWidth()
  for (let i = 0; i < length; i += 4) {
    img.setPixelColor(
      Jimp.rgbaToInt(
        data[i + 2] ?? 0,
        data[i + 1] ?? 0,
        data[i + 0] ?? 0,
        data[i + 3] ?? 0
      ),
      x, y
    )
    x++
    if (x >= width) { x = 0; y++ }
  }
}
