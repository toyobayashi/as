import type { TypeTreeNode } from './TypeTreeNode'

/** @public */
export class SerializedType {
  public classID: number = 0
  public m_IsStrippedType: boolean = false
  public m_ScriptTypeIndex: number = -1
  public m_Nodes: TypeTreeNode[] = []
  public /* byte[] */ m_ScriptID: Buffer = Buffer.alloc(0) // Hash128
  public /* byte[] */ m_OldTypeHash: Buffer = Buffer.alloc(0) // Hash128
  public /* int[] */ m_TypeDependencies: number[] = []
}
