/* eslint-disable eqeqeq */
import { AudioClip, AudioCompressionFormat, AudioType } from '../classes/AudioClip'

// TODO
const FMODModule = require('../../../fmod/fmod.js')

const FMOD: any = {}

function init (): any {
  // const FMOD: any = {}
  FMOD.preRun = () => {} // Will be called before FMOD runs, but after the Emscripten runtime has initialized
  FMOD.onRuntimeInitialized = () => { console.log(2222) } // Called when the Emscripten runtime has initialized
  // FMOD.onAbort = reject
  FMOD.INITIAL_MEMORY = 64 * 1024 * 1024 // FMOD Heap defaults to 16mb which may be enough for this demo, but set it differently here for demonstration (64mb)
  FMODModule(FMOD)
  return FMOD
}

init()

export class AudioClipConverter {
  private readonly m_AudioClip: AudioClip

  public constructor (audioClip: AudioClip) {
    this.m_AudioClip = audioClip
  }

  public async convertToWav (): Promise<Buffer | null> {
    // const FMOD = await init()
    const m_AudioClip = this.m_AudioClip
    const m_AudioData = m_AudioClip.m_AudioData.getData()
    if (m_AudioData == null || m_AudioData.length == 0) { return null }
    const exinfo = new FMOD.CREATESOUNDEXINFO()
    const system: any = {}
    let result = FMOD.System_Create(system)
    if (result != FMOD.OK) { return null }
    const gSystem = system.val
    result = gSystem.init(1, FMOD.INIT_NORMAL, null)
    if (result != FMOD.OK) { return null }
    // exinfo.cbsize = Marshal.SizeOf(exinfo);
    exinfo.length = m_AudioClip.m_Size
    const sound: any = {}
    result = gSystem.createSound(m_AudioData.buffer, FMOD.OPENMEMORY, exinfo, sound)
    if (result != FMOD.OK) { return null }
    const gSound = sound.val
    const numsubsounds: any = {}
    result = gSound.getNumSubSounds(numsubsounds)
    if (result != FMOD.OK) { return null }
    const gNumsubsounds = numsubsounds.val
    let buff: Buffer | null
    if (gNumsubsounds > 0) {
      const subsound: any = {}
      result = gSound.getSubSound(0, subsound)
      if (result != FMOD.OK) { return null }
      const gSubsound = subsound.val
      buff = await this.soundToWav(gSubsound)
      gSubsound.release()
    } else {
      buff = await this.soundToWav(gSound)
    }
    gSound.release()
    gSystem.release()
    return buff
  }

  public async soundToWav (sound: any): Promise<Buffer | null> {
    // const FMOD = await init()
    const ochannels: any = {}
    const obits: any = {}
    let result = sound.getFormat({}, {}, ochannels, obits)
    if (result != FMOD.OK) { return null }
    const channels = ochannels.val
    const bits = obits.val

    const ofrequency: any = {}
    result = sound.getDefaults(ofrequency, {})
    if (result != FMOD.OK) { return null }
    const frequency = ofrequency.val
    const sampleRate = frequency

    const olength: any = {}
    result = sound.getLength(olength, /* TIMEUNIT.PCMBYTES */ 0x00000004)
    if (result != FMOD.OK) { return null }
    const length = olength.val

    const optr1: any = {}
    const optr2: any = {}
    const olen1: any = {}
    const olen2: any = {}
    result = FMOD.Sound_Lock(sound, 0, length, optr1, optr2, olen1, olen2)
    if (result != FMOD.OK) { return null }
    const ptr1: number = optr1.val
    const ptr2: number = optr2.val
    const len1: number = olen1.val
    const len2: number = olen2.val

    const buffer = Buffer.alloc(len1 + 44)
    // 添加wav头
    Buffer.from('RIFF').copy(buffer, 0)
    buffer.writeUInt32LE(len1 + 36, 4)
    Buffer.from('WAVEfmt ').copy(buffer, 8)
    buffer.writeUInt32LE(16, 16)
    buffer.writeInt16LE(1, 20)
    buffer.writeInt16LE(channels, 22)
    buffer.writeInt32LE(sampleRate, 24)
    buffer.writeInt32LE(~~(sampleRate * channels * bits / 8), 28)
    buffer.writeInt16LE(~~(channels * bits / 8), 32)
    buffer.writeInt16LE(bits, 34)
    Buffer.from('data').copy(buffer, 36)
    buffer.writeUInt32LE(len1, 40)

    for (let i = 0; i < len1; i++) {
      buffer[44 + i] = FMOD.HEAP8[ptr1 + i]
    }
    result = FMOD.Sound_Unlock(sound, ptr1, ptr2, len1, len2)
    if (result != FMOD.OK) { return null }
    return buffer
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
