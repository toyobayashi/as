/* eslint-disable eqeqeq */
import { existsSync } from 'fs'
import { join } from 'path'
import { AudioClip, AudioCompressionFormat, AudioType } from '../classes/AudioClip'

const binding: {
  init: (dllpath: string) => boolean
  convertToWav: (buffer: Buffer, size: number) => Buffer | null
} = require('../../../dist/binding.node')
// } = require('../../../build/Debug/binding.node')

function getDLLname (name: string): string {
  if (process.platform === 'win32') {
    return `${name}.dll`
  } else if (process.platform === 'linux') {
    return `lib${name}.so`
  } else if (process.platform === 'darwin') {
    return `lib${name}.dylib`
  } else {
    return name
  }
}

const dllpath = join(__dirname, `../../../deps/fmod/lib/${process.platform}/${process.arch}/${getDLLname('fmod')}`)
const supportAudio = existsSync(dllpath) && binding.init(dllpath)
if (!supportAudio) {
  console.warn('Load fmod dynamic library failed')
}

export class AudioClipConverter {
  private readonly m_AudioClip: AudioClip

  public constructor (audioClip: AudioClip) {
    this.m_AudioClip = audioClip
  }

  public convertToWav (): Buffer | null {
    const m_AudioClip = this.m_AudioClip
    const m_AudioData = m_AudioClip.m_AudioData.getData()
    if (m_AudioData == null || m_AudioData.length == 0) { return null }
    return binding.convertToWav(m_AudioData, Number(m_AudioClip.m_Size))
  }

  public get isSupport (): boolean {
    if (this.m_AudioClip.version[0] < 5) {
      switch (this.m_AudioClip.m_Type) {
        case AudioType.AIFF:
        case AudioType.IT:
        case AudioType.MOD:
        case AudioType.S3M:
        case AudioType.XM:
        case AudioType.XMA:
        case AudioType.AUDIOQUEUE:
          return true
        default:
          return false
      }
    } else {
      switch (this.m_AudioClip.m_CompressionFormat) {
        case AudioCompressionFormat.PCM:
        case AudioCompressionFormat.Vorbis:
        case AudioCompressionFormat.ADPCM:
        case AudioCompressionFormat.MP3:
        case AudioCompressionFormat.XMA:
          return true
        default:
          return false
      }
    }
  }
}
