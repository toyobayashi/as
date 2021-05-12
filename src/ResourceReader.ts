import { BinaryReader } from '@tybys/binreader'
import { existsSync, lstatSync, readdirSync } from 'fs'
import { basename, dirname, join, sep } from 'path'
import type { SerializedFile } from './SerializedFile'

function getFiles (dir: string, filename: string): string[] {
  let res: string[] = []
  const items = readdirSync(dir)
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const path = join(dir, item)
    if (lstatSync(path).isDirectory()) {
      const subres = getFiles(path, filename)
      res = [...res, ...subres]
    } else {
      if (path.includes(filename)) {
        res.push(path)
      }
    }
  }
  return res
}

export class ResourceReader {
  private needSearch: boolean = false
  private readonly path: string = ''
  private readonly assetsFile!: SerializedFile
  private /* long */ readonly offset: bigint
  private /* int */ readonly size: number
  private reader: BinaryReader | undefined

  public constructor (reader: BinaryReader, offset: bigint, size: number)
  public constructor (path: string, assetsFile: SerializedFile, offset: bigint, size: number)
  public constructor (pathOrReader: any, assetsFileOrOffset: any, offsetOrSize: any, size?: any) {
    if (typeof pathOrReader === 'string') {
      this.needSearch = true
      this.path = pathOrReader
      this.assetsFile = assetsFileOrOffset
      this.offset = offsetOrSize
      this.size = size
    } else {
      this.reader = pathOrReader
      this.offset = assetsFileOrOffset
      this.size = offsetOrSize
    }
  }

  public getData (): Buffer {
    if (this.needSearch) {
      const resourceFileName = basename(this.path)

      this.reader = this.assetsFile.assetsManager.resourceFileReaders.get(resourceFileName)
      if (this.reader) {
        this.needSearch = false
        this.reader.pos = Number(this.offset)
        return Buffer.from(this.reader.read(this.size))
      }

      const assetsFileDirectory = dirname(this.assetsFile.fullName)
      let resourceFilePath = assetsFileDirectory + sep + resourceFileName
      if (!existsSync(resourceFilePath)) {
        const findFiles = getFiles(assetsFileDirectory, resourceFileName)
        if (findFiles.length > 0) {
          resourceFilePath = findFiles[0]
        }
      }
      if (existsSync(resourceFilePath)) {
        this.reader = new BinaryReader(resourceFilePath)
        this.needSearch = false
        this.assetsFile.assetsManager.resourceFileReaders.set(resourceFileName, this.reader)
        this.reader.pos = Number(this.offset)
        return Buffer.from(this.reader.read(this.size))
      }

      throw new Error(`Can't find the resource file ${resourceFileName}`)
    }

    this.reader!.pos = Number(this.offset)
    return Buffer.from(this.reader!.read(this.size))
  }
}
