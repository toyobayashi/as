/** @public */
export class SerializedFileHeader {
  public /* uint */ m_MetadataSize: number = 0
  public /* long */ m_FileSize: bigint = BigInt(0)
  public /* uint */ m_Version: number = 0
  public /* long */ m_DataOffset: bigint = BigInt(0)
  public /* byte */ m_Endianess: number = 0
  public /* byte[] */ m_Reserved: Buffer = Buffer.alloc(0)
}
