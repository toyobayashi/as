import type { ObjectReader } from '../ObjectReader'
import { EditorExtension } from './EditorExtension'
// import { PPtr } from './PPtr'

export abstract class Component extends EditorExtension {
  // public m_GameObject: PPtr<GameObject>

  protected constructor (reader: ObjectReader) {
    super(reader)
    // this.m_GameObject = new PPtr<GameObject>(reader)
  }
}
