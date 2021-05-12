/** @public */
export class BuildType {
  public constructor (private readonly buildType: string) {}

  public isAlpha (): boolean { return this.buildType === 'a' }
  public isPatch (): boolean { return this.buildType === 'p' }
}
