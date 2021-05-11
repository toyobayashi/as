import type { EndianBinaryReader } from './EndianBinaryReader'
import { SerializedFile } from './SerializedFile'

/** @public */
export enum FileType {
  AssetsFile,
  BundleFile,
  WebFile,
  ResourceFile
}

/** @public */
export function checkFileType (reader: EndianBinaryReader): FileType {
  const signature = reader.readStringToNull(20)
  reader.seek(0)
  switch (signature) {
    case 'UnityWeb':
    case 'UnityRaw':
    case 'UnityArchive':
    case 'UnityFS':
      return FileType.BundleFile
    case 'UnityWebData1.0':
      return FileType.WebFile
    default: {
      let magic = reader.read(2)
      reader.seek(0)
      if (Buffer.from([0x1f, 0x8b]).equals(magic)) {
        return FileType.WebFile
      }
      reader.seek(0x20)
      magic = reader.read(6)
      reader.seek(0)
      if (Buffer.from([0x62, 0x72, 0x6F, 0x74, 0x6C, 0x69]).equals(magic)) {
        return FileType.WebFile
      }
      if (SerializedFile.isSerializedFile(reader)) {
        return FileType.AssetsFile
      } else {
        return FileType.ResourceFile
      }
    }
  }
}
