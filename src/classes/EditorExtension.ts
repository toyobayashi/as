/* eslint-disable no-new */
import { BuildTarget } from '../BuildTarget'
import type { ObjectReader } from '../ObjectReader'
import { Object } from './Object'
import { PPtr } from './PPtr'

export abstract class EditorExtension extends Object {
  protected constructor (reader: ObjectReader) {
    super(reader)
    if (this.platform === BuildTarget.NoTarget) {
      /* const m_PrefabParentObject = */ new PPtr<EditorExtension>(reader)
      /* const m_PrefabInternal = */ new PPtr<Object>(reader) // PPtr<Prefab>
    }
  }
}
