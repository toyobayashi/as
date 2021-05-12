import { writeFileSync } from 'fs'
import { join } from 'path'
import { AudioClip, AudioCompressionFormat, AudioType } from '../classes/AudioClip'
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

export async function exportAudioClip (m_AudioClip: AudioClip, exportPath: string, name: string): Promise<boolean> {
  const m_AudioData = m_AudioClip.m_AudioData.getData()
  if (m_AudioData == null || m_AudioData.length === 0) { return false }
  const converter = new AudioClipConverter(m_AudioClip)
  if (converter.isSupport) {
    const buffer = await converter.convertToWav()
    if (buffer == null) { return false }
    writeFileSync(join(exportPath, name + '.wav'), buffer)
  } else {
    writeFileSync(join(exportPath, name + getExtensionName(m_AudioClip)), m_AudioData)
  }
  return true
}
