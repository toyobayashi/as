import type { BinaryReader } from '@tybys/binreader'
import { basename, dirname, sep } from 'path'
import { BundleFile } from './BundleFile'
import { EndianBinaryReader } from './EndianBinaryReader'
import { checkFileType, FileType } from './import-helper'
import { SerializedFile } from './SerializedFile'

/** @public */
export class AssetsManager {
  public assetsFileList = new Set<SerializedFile>()
  // private readonly assetsFileIndexCache = new Map<string, number>()
  private readonly resourceFileReaders = new Map<string, BinaryReader>()

  // private readonly importFiles = new Set<string>()
  // private readonly importFilesHash = new Set<string>()
  private readonly assetsFileListHash = new Set<string>()

  public async loadFile (fullName: string): Promise<void> {
    const reader = new EndianBinaryReader(fullName)
    switch (checkFileType(reader)) {
      case FileType.AssetsFile:
        // LoadAssetsFile(fullName, reader);
        // break;
        throw new Error('not implemented yet')
      case FileType.BundleFile:
        await this.loadBundleFile(fullName, reader)
        break
      case FileType.WebFile:
        // LoadWebFile(fullName, reader);
        // break;
        throw new Error('not implemented yet')
    }
  }

  private async loadBundleFile (fullName: string, reader: EndianBinaryReader, parentPath: string | null = null): Promise<void> {
    const fileName = basename(fullName)
    console.info('Loading ' + fileName)
    try {
      const bundleFile = await BundleFile.build(reader, fullName)
      for (const file of bundleFile.fileList) {
        const subReader = new EndianBinaryReader(file.stream)
        if (SerializedFile.isSerializedFile(subReader)) {
          const dummyPath = dirname(fullName) + sep + file.fileName
          this.loadAssetsFromMemory(dummyPath, subReader, parentPath ?? fullName, bundleFile.m_Header.unityRevision)
        } else {
          this.resourceFileReaders.set(file.fileName, subReader)
        }
      }
    } catch (err) {
      console.error(err)
      /* var str = $"Unable to load bundle file {fileName}";
                if (parentPath != null)
                {
                    str += $" from {Path.GetFileName(parentPath)}";
                }
                Logger.Error(str); */
    }
    reader.dispose()
  }

  private loadAssetsFromMemory (fullName: string, reader: EndianBinaryReader, originalPath: string, unityVersion: string = ''): void {
    const fileName = basename(fullName)
    if (!this.assetsFileListHash.has(fileName)) {
      try {
        const assetsFile = new SerializedFile(this, fullName, reader)
        assetsFile.originalPath = originalPath
        if (assetsFile.header.m_Version < 7) {
          assetsFile.setVersion(unityVersion)
        }
        this.assetsFileList.add(assetsFile)
        this.assetsFileListHash.add(assetsFile.fileName)
      } catch (_) {
        // console.error(_)
        // console.error(`Unable to load assets file ${fileName} from ${basename(originalPath)}`)
        this.resourceFileReaders.set(fileName, reader)
      }
    }
  }

  public readAssets (): void {
    // TODO
    console.log('not implemented yet')
  }
}
