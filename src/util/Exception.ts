export abstract class Exception extends Error {
  protected constructor (message: string) {
    super(message)
  }

  public what (): string {
    return this.message
  }
}

export class NotImplementedException extends Exception {
  public constructor (
    public method: string,
    public type: string
  ) {
    super(`[${method}] {${type}}`)
  }
}
