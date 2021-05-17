import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { AudioClip, AudioCompressionFormat, AudioType } from '../classes/AudioClip'
import type { Texture2D } from '../classes/Texture2D'
import { AudioClipConverter } from './AudioClipConverter'

function getExtensionName (m_AudioClip: AudioClip): string {
  if (m_AudioClip.version[0] < 5) {
    switch (m_AudioClip.m_Type) {
      case AudioType.ACC:
        return '.m4a'
      case AudioType.AIFF:
        return '.aif'
      case AudioType.IT:
        return '.it'
      case AudioType.MOD:
        return '.mod'
      case AudioType.MPEG:
        return '.mp3'
      case AudioType.OGGVORBIS:
        return '.ogg'
      case AudioType.S3M:
        return '.s3m'
      case AudioType.WAV:
        return '.wav'
      case AudioType.XM:
        return '.xm'
      case AudioType.XMA:
        return '.wav'
      case AudioType.VAG:
        return '.vag'
      case AudioType.AUDIOQUEUE:
        return '.fsb'
    }
  } else {
    switch (m_AudioClip.m_CompressionFormat) {
      case AudioCompressionFormat.PCM:
        return '.fsb'
      case AudioCompressionFormat.Vorbis:
        return '.fsb'
      case AudioCompressionFormat.ADPCM:
        return '.fsb'
      case AudioCompressionFormat.MP3:
        return '.fsb'
      case AudioCompressionFormat.VAG:
        return '.fsb'
      case AudioCompressionFormat.HEVAG:
        return '.fsb'
      case AudioCompressionFormat.XMA:
        return '.fsb'
      case AudioCompressionFormat.AAC:
        return '.m4a'
      case AudioCompressionFormat.GCADPCM:
        return '.fsb'
      case AudioCompressionFormat.ATRAC9:
        return '.fsb'
    }
  }

  return '.AudioClip'
}

export function exportAudioClip (m_AudioClip: AudioClip, exportPath: string, name: string): boolean {
  const m_AudioData = m_AudioClip.m_AudioData.getData()
  if (m_AudioData == null || m_AudioData.length === 0) { return false }
  const converter = new AudioClipConverter(m_AudioClip)
  if (converter.isSupport) {
    const buffer = converter.convertToWav()
    if (buffer == null) { return false }
    const outfile = join(exportPath, name + '.wav')
    mkdirSync(dirname(outfile), { recursive: true })
    writeFileSync(outfile, buffer)
  } else {
    const outfile = join(exportPath, name + getExtensionName(m_AudioClip))
    mkdirSync(dirname(outfile), { recursive: true })
    writeFileSync(outfile, m_AudioData)
  }
  return true
}

export enum ImageFormat {
  Bmp = 'image/bmp',
  Png = 'image/png',
  Jpeg = 'image/jpeg'
}

export async function exportTexture2D (m_Texture2D: Texture2D, type: 'BMP' | 'PNG' | 'JPEG' | null, exportPath: string, name: string): Promise<boolean> {
  let format: ImageFormat | undefined
  const ext = type
  switch (ext) {
    case 'BMP':
      format = ImageFormat.Bmp
      break
    case 'PNG':
      format = ImageFormat.Png
      break
    case 'JPEG':
      format = ImageFormat.Jpeg
      break
    default: break
  }
  if (format) {
    const bitmap = m_Texture2D.convertToBitmap(true)
    if (bitmap == null) { return false }
    const outfile = join(exportPath, name + '.' + format.split('/')[1])
    mkdirSync(dirname(outfile), { recursive: true })
    await bitmap.writeAsync(outfile)
  } else {
    const outfile = join(exportPath, name + '.tex')
    mkdirSync(dirname(outfile), { recursive: true })
    writeFileSync(outfile, m_Texture2D.image_data.getData())
  }
  return true
}
