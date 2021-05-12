import type { ObjectReader } from '../ObjectReader'
import { EditorExtension } from './EditorExtension'

export class NamedObject extends EditorExtension {
  public m_Name: string

  protected constructor (reader: ObjectReader) {
    super(reader)
    this.m_Name = reader.readAlignedString()
  }
}
