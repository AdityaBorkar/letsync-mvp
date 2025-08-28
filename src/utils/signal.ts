export class Signal<T> {
  private value: T

  constructor(value: T) {
    this.value = value
  }

  get() {
    return this.value
  }

  set(value: T) {
    this.value = value
  }
}
