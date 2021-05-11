import { openSync, mkdirSync, readSync } from 'fs'
import { basename, sep } from 'path'
import { EndianBinaryReader } from './EndianBinaryReader'
import { Stream, FileStream, MemoryStream } from './util/Stream'
import { using, usingAsync } from './util/using'

/** @public */
export class Header {
  public signature: string = ''
  public version: number = 0
  public unityVersion: string = ''
  public unityRevision: string = ''
  public size: bigint = BigInt(0)
  public compressedBlocksInfoSize: number = 0
  public uncompressedBlocksInfoSize: number = 0
  public flags: number = 0
}

class StorageBlock {
  public compressedSize: number = 0
  public uncompressedSize: number = 0
  public flags: number = 0
}

class Node {
  public offset: bigint = BigInt(0)
  public size: bigint = BigInt(0)
  public flags: number = 0
  public path: string = ''
}

const INT_MAX = 2147483647

/** @public */
export class StreamFile {
  public fileName: string = ''
  public stream!: Stream
}

function lzmaDec (buf: Buffer): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    (require('lzma-native') as typeof import('lzma-native')).decompress(buf, undefined, (result) => {
      if (Buffer.isBuffer(result)) {
        resolve(result)
      } else {
        reject(result)
      }
    })
  })
}

/** @public */
export class BundleFile {
  public m_Header: Header = new Header()
  private readonly m_BlocksInfo: StorageBlock[] = []
  private readonly m_DirectoryInfo: Node[] = []
  public fileList: StreamFile[] = []

  public static async build (reader: EndianBinaryReader, path: string): Promise<BundleFile> {
    const instance = new BundleFile()
    const m_Header = instance.m_Header
    m_Header.signature = reader.readStringToNull()
    m_Header.version = reader.readUInt32()
    m_Header.unityVersion = reader.readStringToNull()
    m_Header.unityRevision = reader.readStringToNull()
    switch (m_Header.signature) {
      case 'UnityArchive':
        break // TODO
      case 'UnityWeb':
      case 'UnityRaw': {
        if (m_Header.version === 6) {
          await instance.resolveUnityFS(reader, path)
        } else {
          await instance.resolveUnityRaw(reader, path)
        }
        break
      }
      case 'UnityFS': {
        await instance.resolveUnityFS(reader, path)
        break
      }
    }
    return instance
  }

  private constructor () {}

  private async resolveUnityRaw (reader: EndianBinaryReader, path: string): Promise<void> {
    this.readHeaderAndBlocksInfo(reader)
    const blocksStream = this.createBlocksStream(path)
    await usingAsync(blocksStream, async (blocksStream) => {
      await this.readBlocksAndDirectory(reader, blocksStream)
      this.readFiles(blocksStream, path)
    })
  }

  private async resolveUnityFS (reader: EndianBinaryReader, path: string): Promise<void> {
    this.readHeader(reader)
    await this.readBlocksInfoAndDirectory(reader)
    const blocksStream = this.createBlocksStream(path)
    await usingAsync(blocksStream, async (blocksStream) => {
      await this.readBlocks(reader, blocksStream)
      this.readFiles(blocksStream, path)
    })
  }

  private readFiles (blocksStream: Stream, path: string): void {
    this.fileList.length = this.m_DirectoryInfo.length
    for (let i = 0; i < this.m_DirectoryInfo.length; i++) {
      const node = this.m_DirectoryInfo[i]
      const file = new StreamFile()
      this.fileList[i] = file
      file.fileName = basename(node.path)
      if (node.size >= INT_MAX) {
        /* var memoryMappedFile = MemoryMappedFile.CreateNew(file.fileName, entryinfo_size);
          file.stream = memoryMappedFile.CreateViewStream(); */
        const extractPath = path + '_unpacked'
        mkdirSync(extractPath, { recursive: true })
        const p = extractPath + sep + file.fileName
        const fd = openSync(p, 'w+')
        file.stream = new FileStream(fd, p, 0)
      } else {
        file.stream = new MemoryStream(Number(node.size))
      }
      if (blocksStream instanceof FileStream) {
        const buf = Buffer.alloc(Number(node.size))
        readSync(blocksStream.fd, buf, 0, Number(node.size), Number(node.offset))
        file.stream.write(buf)
      } else if (blocksStream instanceof MemoryStream) {
        const buf = blocksStream.buffer.slice(Number(node.offset), Number(node.offset) + Number(node.size))
        file.stream.write(buf)
      } else {
        throw new Error('This should not happen')
      }
      file.stream.pos = 0
    }
  }

  private async readBlocks (reader: EndianBinaryReader, blocksStream: Stream): Promise<void> {
    for (const blockInfo of this.m_BlocksInfo) {
      switch (blockInfo.flags & 0x3F) { // kStorageBlockCompressionTypeMask
        case 1: { // LZMA
          const compressed = Buffer.from(reader.read(blockInfo.compressedSize))
          const buf = await lzmaDec(compressed)
          if (buf.length !== blockInfo.uncompressedSize) {
            console.log('buf.length !== blockInfo.uncompressedSize', buf.length, blockInfo.uncompressedSize)
          }
          blocksStream.write(buf)
          break
        }
        case 2: // LZ4
        case 3: { // LZ4HC
          const compressedStream = Buffer.from(reader.read(blockInfo.compressedSize))
          let uncompressedBytes = Buffer.alloc(blockInfo.uncompressedSize)
          const size = require('lz4').decodeBlock(compressedStream, uncompressedBytes)
          uncompressedBytes = uncompressedBytes.slice(0, size)
          blocksStream.write(uncompressedBytes)
          break
        }
        default: { // None
          blocksStream.write(Buffer.from(reader.read(blockInfo.compressedSize)))
          break
        }
      }
    }
    blocksStream.pos = 0
  }

  private async readBlocksInfoAndDirectory (reader: EndianBinaryReader): Promise<void> {
    let blocksInfoBytes: Buffer
    const m_Header = this.m_Header
    if (m_Header.version >= 7) {
      reader.alignStream(16)
    }
    if ((m_Header.flags & 0x80) !== 0) { // kArchiveBlocksInfoAtTheEnd
      const position = reader.tell()
      reader.pos = reader.size - m_Header.compressedBlocksInfoSize
      blocksInfoBytes = Buffer.from(reader.read(m_Header.compressedBlocksInfoSize))
      reader.pos = position
    } else { // 0x40 kArchiveBlocksAndDirectoryInfoCombined
      blocksInfoBytes = Buffer.from(reader.read(m_Header.compressedBlocksInfoSize))
    }
    const blocksInfoCompressedStream = blocksInfoBytes
    let blocksInfoUncompresseddStream: Buffer
    switch (m_Header.flags & 0x3F) { // kArchiveCompressionTypeMask
      case 1: { // LZMA
        blocksInfoUncompresseddStream = await lzmaDec(blocksInfoCompressedStream)
        break
      }
      case 2: // LZ4
      case 3: { // LZ4HC
        let uncompressedBytes = Buffer.alloc(m_Header.uncompressedBlocksInfoSize)
        const size = require('lz4').decodeBlock(blocksInfoCompressedStream, uncompressedBytes)
        uncompressedBytes = uncompressedBytes.slice(0, size)
        blocksInfoUncompresseddStream = uncompressedBytes
        break
      }
      default: { // None
        blocksInfoUncompresseddStream = blocksInfoCompressedStream
        break
      }
    }
    const blocksInfoReader = new EndianBinaryReader(blocksInfoUncompresseddStream)
    using(blocksInfoReader, (blocksInfoReader) => {
      /* const uncompressedDataHash = */ blocksInfoReader.read(16)
      const blocksInfoCount = blocksInfoReader.readInt32()
      this.m_BlocksInfo.length = 0
      this.m_BlocksInfo.length = blocksInfoCount
      for (let i = 0; i < blocksInfoCount; i++) {
        this.m_BlocksInfo[i] = new StorageBlock()
        this.m_BlocksInfo[i].uncompressedSize = blocksInfoReader.readUInt32()
        this.m_BlocksInfo[i].compressedSize = blocksInfoReader.readUInt32()
        this.m_BlocksInfo[i].flags = blocksInfoReader.readUInt16()
      }

      const nodesCount = blocksInfoReader.readInt32()
      this.m_DirectoryInfo.length = 0
      this.m_DirectoryInfo.length = nodesCount
      for (let i = 0; i < nodesCount; i++) {
        this.m_DirectoryInfo[i] = new Node()
        this.m_DirectoryInfo[i].offset = blocksInfoReader.readBigInt64()
        this.m_DirectoryInfo[i].size = blocksInfoReader.readBigInt64()
        this.m_DirectoryInfo[i].flags = blocksInfoReader.readUInt32()
        this.m_DirectoryInfo[i].path = blocksInfoReader.readStringToNull()
      }
    })
  }

  private async readBlocksAndDirectory (reader: EndianBinaryReader, blocksStream: Stream): Promise<void> {
    const m_BlocksInfo = this.m_BlocksInfo
    for (const blockInfo of m_BlocksInfo) {
      let uncompressedBytes = Buffer.from(reader.read(blockInfo.compressedSize))
      if (blockInfo.flags === 1) {
        uncompressedBytes = await lzmaDec(uncompressedBytes)
      }
      blocksStream.write(uncompressedBytes)
    }
    blocksStream.pos = 0
    const blocksReader = new EndianBinaryReader(blocksStream)

    blocksReader.seek(0)
    const nodesCount = blocksReader.readInt32()
    for (let i = 0; i < nodesCount; i++) {
      this.m_DirectoryInfo[i] = new Node()
      this.m_DirectoryInfo[i].path = blocksReader.readStringToNull()
      this.m_DirectoryInfo[i].offset = BigInt(blocksReader.readUInt32())
      this.m_DirectoryInfo[i].size = BigInt(blocksReader.readUInt32())
    }
  }

  private createBlocksStream (path: string): Stream {
    let blocksStream: Stream
    const uncompressedSizeSum = this.m_BlocksInfo.reduce((pv, c) => (pv + c.uncompressedSize), 0)
    if (uncompressedSizeSum >= INT_MAX) {
      /* var memoryMappedFile = MemoryMappedFile.CreateNew(Path.GetFileName(path), uncompressedSizeSum);
          assetsDataStream = memoryMappedFile.CreateViewStream(); */
      const p = path + '.temp'
      const fd = openSync(p, 'w+')
      blocksStream = new FileStream(fd, p, 0)
    } else {
      blocksStream = new MemoryStream(uncompressedSizeSum)
    }
    return blocksStream
  }

  private readHeader (reader: EndianBinaryReader): void {
    const m_Header = this.m_Header
    m_Header.size = reader.readBigInt64()
    m_Header.compressedBlocksInfoSize = reader.readUInt32()
    m_Header.uncompressedBlocksInfoSize = reader.readUInt32()
    m_Header.flags = reader.readUInt32()
    if (m_Header.signature !== 'UnityFS') {
      reader.read()
    }
  }

  private readHeaderAndBlocksInfo (reader: EndianBinaryReader): void {
    const m_Header = this.m_Header
    const isCompressed = m_Header.signature === 'UnityWeb'
    if (m_Header.version >= 4) {
      /* const hash = */ reader.read(16)
      /* const crc = */ reader.readUInt32()
    }
    /* const minimumStreamedBytes = */ reader.readUInt32()
    m_Header.size = BigInt(reader.readUInt32())
    /* const numberOfLevelsToDownloadBeforeStreaming = */ reader.readUInt32()
    const levelCount = reader.readInt32()
    for (let i = 0; i < levelCount; i++) {
      const storageBlock = new StorageBlock()
      storageBlock.compressedSize = reader.readUInt32()
      storageBlock.uncompressedSize = reader.readUInt32()
      storageBlock.flags = (isCompressed ? 1 : 0)
      if (i === levelCount - 1) {
        this.m_BlocksInfo[0] = storageBlock
      }
    }
    if (m_Header.version >= 2) {
      /* const completeFileSize = */ reader.readUInt32()
    }
    if (m_Header.version >= 3) {
      /* const fileInfoHeaderSize = */ reader.readUInt32()
    }
    reader.seek(Number(m_Header.size))
  }
}
