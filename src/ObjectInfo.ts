import type { SerializedType } from './SerializedType'

/** @public */
export class ObjectInfo {
  public /* long */ byteStart = BigInt(0)
  public /* uint */ byteSize = 0
  public /* int */ typeID = 0
  public /* int */ classID = 0

  public /* long */ m_PathID = BigInt(0)
  public serializedType: SerializedType | null = null
}
