/** @public */
export class TypeTreeNode {
  public m_Type = ''
  public m_Name = ''
  public m_ByteSize = 0
  public m_Index = 0
  public m_IsArray = 0 // m_TypeFlags
  public m_Version = 0
  public m_MetaFlag = 0
  public m_Level = 0
  public /* uint */ m_TypeStrOffset = 0
  public /* uint */ m_NameStrOffset = 0
  public /* ulong */ m_RefTypeHash = BigInt(0)

  public constructor (type?: string, name?: string, level?: number, align?: boolean) {
    this.m_Type = type ?? ''
    this.m_Name = name ?? ''
    this.m_Level = level ?? 0
    this.m_MetaFlag = align ? 0x4000 : 0
  }
}
