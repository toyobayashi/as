import { ClassIDType } from '../ClassIDType'
import type { ObjectReader } from '../ObjectReader'
import type { BuildType } from '../BuildType'
import type { SerializedFile } from '../SerializedFile'
import { BuildTarget } from '../BuildTarget'
import type { SerializedType } from '../SerializedType'
class _Object {
  public assetsFile: SerializedFile
  public reader: ObjectReader
  public /* long */ m_PathID: bigint
  public /* int[] */ version: number[]
  protected buildType: BuildType | null
  public platform: BuildTarget
  public type: ClassIDType
  public serializedType: SerializedType | null
  public /* uint */ byteSize: number

  public constructor (reader: ObjectReader) {
    this.reader = reader
    reader.reset()
    this.assetsFile = reader.assetsFile
    this.type = reader.classIDType
    this.m_PathID = reader.m_PathID
    this.version = reader.version
    this.buildType = reader.buildType
    this.platform = reader.platform
    this.serializedType = reader.serializedType
    this.byteSize = reader.byteSize

    if (this.platform === BuildTarget.NoTarget) {
      /* var m_ObjectHideFlags = */ reader.readUInt32()
    }
  }

  public get [Symbol.toStringTag] (): string {
    return ClassIDType[this.type] ?? 'UnknownType'
  }

  protected hasStructMember (name: string): boolean {
    return this.serializedType?.m_Nodes != null && this.serializedType.m_Nodes.some(x => x.m_Name === name)
  }

  /* public dump(m_Nodes?: TypeTreeNode[]): string | null
        {
          if (m_Nodes != null) {
            if (m_Nodes != null)
            {
                var sb = new StringBuilder();
                TypeTreeHelper.ReadTypeString(sb, m_Nodes, reader);
                return sb.ToString();
            }
            return null;
          }
          if (this.serializedType?.m_Nodes != null)
          {
              var sb = new StringBuilder();
              TypeTreeHelper.ReadTypeString(sb, this.serializedType.m_Nodes, reader);
              return sb.ToString();
          }
          return null;
        } */

  /* public toType(m_Nodes?: TypeTreeNode[]): OrderedDictionary
        {
          if (m_Nodes != null) {
            if (m_Nodes != null)
            {
                return TypeTreeHelper.ReadType(m_Nodes, reader);
            }
            return null;
          }
            if (serializedType?.m_Nodes != null)
            {
                return TypeTreeHelper.ReadType(serializedType.m_Nodes, reader);
            }
            return null;
        } */

  public getRawData (): Buffer {
    this.reader.reset()
    return Buffer.from(this.reader.read(this.byteSize))
  }
}

export { _Object as Object }
