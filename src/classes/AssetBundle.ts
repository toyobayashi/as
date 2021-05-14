import type { ObjectReader } from '../ObjectReader'
import { NamedObject } from './NamedObject'
import type { Object } from './Object'
import { PPtr } from './PPtr'

class AssetInfo {
  public /* int */ preloadIndex: number
  public /* int */ preloadSize: number
  public asset: PPtr<Object>

  public constructor (reader: ObjectReader) {
    this.preloadIndex = reader.readInt32()
    this.preloadSize = reader.readInt32()
    this.asset = new PPtr<Object>(reader)
  }
}

/** @public */
export class AssetBundle extends NamedObject {
  public m_PreloadTable: Array<PPtr<Object>>
  public m_Container: Array<[string, AssetInfo]>

  public constructor (reader: ObjectReader) {
    super(reader)
    const m_PreloadTableSize = reader.readInt32()
    this.m_PreloadTable = Array(m_PreloadTableSize)
    for (let i = 0; i < m_PreloadTableSize; i++) {
      this.m_PreloadTable[i] = new PPtr<Object>(reader)
    }

    const m_ContainerSize = reader.readInt32()
    this.m_Container = Array(m_ContainerSize)
    for (let i = 0; i < m_ContainerSize; i++) {
      this.m_Container[i] = [reader.readAlignedString(), new AssetInfo(reader)]
    }
  }
}
