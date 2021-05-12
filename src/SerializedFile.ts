import type { BinaryReader } from '@tybys/binreader'
import { EndianType } from '@tybys/binreader'
import { basename } from 'path'
import type { AssetsManager } from './AssetsManager'
import { stringBuffer } from './common-string'
import { EndianBinaryReader } from './EndianBinaryReader'
import { MemoryStream } from './util/Stream'
import { using } from './util/using'
import type { Object } from './classes/Object'
import { SerializedFileHeader } from './SerializedFileHeader'
import { BuildType } from './BuildType'
import { BuildTarget } from './BuildTarget'
import { SerializedType } from './SerializedType'
import { TypeTreeNode } from './TypeTreeNode'
import { ObjectInfo } from './ObjectInfo'

/** @public */
export class LocalSerializedObjectIdentifier {
  public localSerializedFileIndex: number = 0
  public /* long */ localIdentifierInFile: bigint = BigInt(0)
}

/** @public */
export class FileIdentifier {
  public guid!: Guid
  public /* int */ type = 1 // enum { kNonAssetType = 0, kDeprecatedCachedAssetType = 1, kSerializedAssetType = 2, kMetaAssetType = 3 };
  public pathName = ''

  // custom
  public fileName = ''
}

export class Guid {
  public readonly buffer: Buffer

  public constructor (b: Buffer) {
    this.buffer = b
  }
}

/** @public */
export class SerializedFile {
  public assetsManager: AssetsManager
  public reader: EndianBinaryReader
  public fullName: string = ''
  public originalPath: string = ''
  public fileName: string = ''
  public version: number[] = [0, 0, 0, 0]
  public buildType: BuildType | null = null
  public Objects: Set<Object>
  public ObjectsDic: Map<bigint, Object>

  public header: SerializedFileHeader
  public m_FileEndianess: EndianType
  public unityVersion: string = '2.5.0f5'
  public m_TargetPlatform: BuildTarget = BuildTarget.UnknownPlatform
  private readonly m_EnableTypeTree: boolean = true
  public m_Types: SerializedType[]
  public m_RefTypes: Set<SerializedType> | null = null
  public m_Objects: Set<ObjectInfo>
  private readonly m_ScriptTypes: Set<LocalSerializedObjectIdentifier> | null = null
  public m_Externals: Set<FileIdentifier>

  public constructor (assetsManager: AssetsManager, fullName: string, reader: EndianBinaryReader) {
    this.assetsManager = assetsManager
    this.reader = reader
    this.fullName = fullName
    this.fileName = basename(fullName)

    // ReadHeader
    const header = this.header = new SerializedFileHeader()
    header.m_MetadataSize = reader.readUInt32()
    header.m_FileSize = BigInt(reader.readUInt32())
    header.m_Version = reader.readUInt32()
    header.m_DataOffset = BigInt(reader.readUInt32())

    if (header.m_Version >= 9) {
      header.m_Endianess = reader.readUInt8()
      header.m_Reserved = Buffer.from(reader.read(3))
      this.m_FileEndianess = header.m_Endianess
    } else {
      reader.pos = Number(header.m_FileSize) - header.m_MetadataSize
      this.m_FileEndianess = reader.readUInt8()
    }

    if (header.m_Version >= 22) {
      header.m_MetadataSize = reader.readUInt32()
      header.m_FileSize = reader.readBigInt64()
      header.m_DataOffset = reader.readBigInt64()
      reader.readBigInt64() // unknown
    }

    // ReadMetadata
    if (this.m_FileEndianess === EndianType.LittleEndian) {
      reader.endian = EndianType.LittleEndian
    }
    if (header.m_Version >= 7) {
      this.unityVersion = reader.readStringToNull()
      this.setVersion(this.unityVersion)
    }
    if (header.m_Version >= 8) {
      this.m_TargetPlatform = reader.readInt32()
      if (BuildTarget[this.m_TargetPlatform] == null) {
        this.m_TargetPlatform = BuildTarget.UnknownPlatform
      }
    }
    if (header.m_Version >= 13) {
      this.m_EnableTypeTree = reader.readBoolean()
    }

    // ReadTypes
    const typeCount = reader.readInt32()
    this.m_Types = []
    for (let i = 0; i < typeCount; i++) {
      this.m_Types.push(this.readSerializedType())
    }

    let bigIDEnabled = 0
    if (header.m_Version >= 7 && header.m_Version < 14) {
      bigIDEnabled = reader.readInt32()
    }

    // ReadObjects
    const objectCount = reader.readInt32()
    this.m_Objects = new Set<ObjectInfo>(/* objectCount */)
    this.Objects = new Set<Object>(/* objectCount */)
    this.ObjectsDic = new Map<bigint, Object>(/* objectCount */)
    for (let i = 0; i < objectCount; i++) {
      const objectInfo = new ObjectInfo()
      if (bigIDEnabled !== 0) {
        objectInfo.m_PathID = reader.readBigInt64()
      } else if (header.m_Version < 14) {
        objectInfo.m_PathID = BigInt(reader.readInt32())
      } else {
        reader.alignStream()
        objectInfo.m_PathID = reader.readBigInt64()
      }

      if (header.m_Version >= 22) { objectInfo.byteStart = reader.readBigInt64() } else { objectInfo.byteStart = BigInt(reader.readUInt32()) }

      objectInfo.byteStart += header.m_DataOffset
      objectInfo.byteSize = reader.readUInt32()
      objectInfo.typeID = reader.readInt32()
      if (header.m_Version < 16) {
        objectInfo.classID = reader.readUInt16()
        for (const x of this.m_Types) {
          if (x.classID === objectInfo.typeID) {
            objectInfo.serializedType = x
            break
          }
        }
      } else {
        const type = this.m_Types[objectInfo.typeID]
        objectInfo.serializedType = type
        objectInfo.classID = type.classID
      }
      if (header.m_Version < 11) {
        /* var isDestroyed = */ reader.readUInt16()
      }
      if (header.m_Version >= 11 && header.m_Version < 17) {
        const m_ScriptTypeIndex = reader.readInt16()
        if (objectInfo.serializedType != null) { objectInfo.serializedType.m_ScriptTypeIndex = m_ScriptTypeIndex }
      }
      if (header.m_Version === 15 || header.m_Version === 16) {
        /* var stripped = */ reader.readUInt8()
      }
      this.m_Objects.add(objectInfo)
    }

    if (header.m_Version >= 11) {
      const scriptCount = reader.readInt32()
      this.m_ScriptTypes = new Set<LocalSerializedObjectIdentifier>(/* scriptCount */)
      for (let i = 0; i < scriptCount; i++) {
        const m_ScriptType = new LocalSerializedObjectIdentifier()
        m_ScriptType.localSerializedFileIndex = reader.readInt32()
        if (header.m_Version < 14) {
          m_ScriptType.localIdentifierInFile = BigInt(reader.readInt32())
        } else {
          reader.alignStream()
          m_ScriptType.localIdentifierInFile = reader.readBigInt64()
        }
        this.m_ScriptTypes.add(m_ScriptType)
      }
    }

    const externalsCount = reader.readInt32()
    this.m_Externals = new Set<FileIdentifier>(/* externalsCount */)
    for (let i = 0; i < externalsCount; i++) {
      const m_External = new FileIdentifier()
      if (header.m_Version >= 6) {
        /* var tempEmpty = */ reader.readStringToNull()
      }
      if (header.m_Version >= 5) {
        m_External.guid = new Guid(Buffer.from(reader.read(16)))
        m_External.type = reader.readInt32()
      }
      m_External.pathName = reader.readStringToNull()
      m_External.fileName = basename(m_External.pathName)
      this.m_Externals.add(m_External)
    }

    if (header.m_Version >= 20) {
      const refTypesCount = reader.readInt32()
      this.m_RefTypes = new Set<SerializedType>(/* refTypesCount */)
      for (let i = 0; i < refTypesCount; i++) {
        this.m_RefTypes.add(this.readSerializedType())
      }
    }

    if (header.m_Version >= 5) {
      /* var userInformation = */ reader.readStringToNull()
    }

    // reader.AlignStream(16);
  }

  public setVersion (stringVersion: string): void {
    this.unityVersion = stringVersion
    const buildSplit = stringVersion.replace(/\d/g, '').split('.').filter(s => !!s)
    this.buildType = new BuildType(buildSplit[0])
    const versionSplit = stringVersion.replace(/\D/g, '.').split('.')
    this.version = versionSplit.map((v) => parseInt(v))
  }

  private readSerializedType (): SerializedType {
    const header = this.header
    const reader = this.reader
    const type = new SerializedType()

    type.classID = reader.readInt32()

    if (header.m_Version >= 16) {
      type.m_IsStrippedType = reader.readBoolean()
    }

    if (header.m_Version >= 17) {
      type.m_ScriptTypeIndex = reader.readInt16()
    }

    if (header.m_Version >= 13) {
      if ((header.m_Version < 16 && type.classID < 0) || (header.m_Version >= 16 && type.classID === 114)) {
        type.m_ScriptID = Buffer.from(reader.read(16)) // Hash128
      }
      type.m_OldTypeHash = Buffer.from(reader.read(16)) // Hash128
    }

    if (this.m_EnableTypeTree) {
      const typeTree: TypeTreeNode[] = []
      if (header.m_Version >= 12 || header.m_Version === 10) {
        this.typeTreeBlobRead(typeTree)
      } else {
        this.readTypeTree(typeTree)
      }

      if (header.m_Version >= 21) {
        type.m_TypeDependencies = reader.readInt32Array()
      }

      type.m_Nodes = typeTree
    }

    return type
  }

  private typeTreeBlobRead (typeTree: TypeTreeNode[]): void {
    const header = this.header
    const reader = this.reader
    const numberOfNodes = reader.readInt32()
    const stringBufferSize = reader.readInt32()
    for (let i = 0; i < numberOfNodes; i++) {
      const typeTreeNode = new TypeTreeNode()
      typeTree.push(typeTreeNode)
      typeTreeNode.m_Version = reader.readUInt16()
      typeTreeNode.m_Level = reader.readUInt8()
      typeTreeNode.m_IsArray = reader.readBoolean() ? 1 : 0
      typeTreeNode.m_TypeStrOffset = reader.readUInt32()
      typeTreeNode.m_NameStrOffset = reader.readUInt32()
      typeTreeNode.m_ByteSize = reader.readInt32()
      typeTreeNode.m_Index = reader.readInt32()
      typeTreeNode.m_MetaFlag = reader.readInt32()
      if (header.m_Version >= 19) {
        typeTreeNode.m_RefTypeHash = reader.readBigUInt64()
      }
    }
    const m_StringBuffer = Buffer.from(reader.read(stringBufferSize))
    const stringBufferReader: EndianBinaryReader = new EndianBinaryReader(new MemoryStream(m_StringBuffer))
    using(stringBufferReader, (stringBufferReader) => {
      for (let i = 0; i < numberOfNodes; i++) {
        const typeTreeNode = typeTree[i]
        typeTreeNode.m_Type = readString(stringBufferReader, typeTreeNode.m_TypeStrOffset)
        typeTreeNode.m_Name = readString(stringBufferReader, typeTreeNode.m_NameStrOffset)
      }
    })

    function readString (stringBufferReader: EndianBinaryReader, value: number): string {
      const isOffset = ((value >>> 0) & 0x80000000) === 0
      if (isOffset) {
        stringBufferReader.pos = value
        return stringBufferReader.readStringToNull()
      }
      const offset = (value >>> 0) & 0x7FFFFFFF
      if (stringBuffer.has(offset)) {
        return stringBuffer.get(offset)!
      }
      return offset.toString()
    }
  }

  public addObject (obj: Object): void {
    this.Objects.add(obj)
    this.ObjectsDic.set(obj.m_PathID, obj)
  }

  private readTypeTree (typeTree: TypeTreeNode[], level = 0): void {
    const header = this.header
    const reader = this.reader
    const typeTreeNode = new TypeTreeNode()
    typeTree.push(typeTreeNode)
    typeTreeNode.m_Level = level
    typeTreeNode.m_Type = reader.readStringToNull()
    typeTreeNode.m_Name = reader.readStringToNull()
    typeTreeNode.m_ByteSize = reader.readInt32()
    if (header.m_Version === 2) {
      /* var variableCount = */ reader.readInt32()
    }
    if (header.m_Version !== 3) {
      typeTreeNode.m_Index = reader.readInt32()
    }
    typeTreeNode.m_IsArray = reader.readInt32()
    typeTreeNode.m_Version = reader.readInt32()
    if (header.m_Version !== 3) {
      typeTreeNode.m_MetaFlag = reader.readInt32()
    }

    const childrenCount = reader.readInt32()
    for (let i = 0; i < childrenCount; i++) {
      this.readTypeTree(typeTree, level + 1)
    }
  }

  public static isSerializedFile (reader: BinaryReader): boolean {
    const fileSize = reader.size
    if (fileSize < 20) {
      return false
    }
    /* let m_MetadataSize = */ reader.readUInt32()
    let m_FileSize: number | bigint = reader.readUInt32()
    const m_Version = reader.readUInt32()
    let m_DataOffset: number | bigint = reader.readUInt32()
    /* const m_Endianess = */ reader.read()/* [0] */
    /* const m_Reserved = */ reader.read(3)
    if (m_Version >= 22) {
      if (fileSize < 48) {
        return false
      }
      /* m_MetadataSize = */ reader.readUInt32()
      m_FileSize = reader.readBigInt64()
      m_DataOffset = reader.readBigInt64()
    }
    if (BigInt(m_FileSize) !== BigInt(fileSize)) {
      reader.seek(0)
      return false
    }
    if (m_DataOffset > fileSize) {
      reader.seek(0)
      return false
    }
    reader.seek(0)
    return true
  }
}
