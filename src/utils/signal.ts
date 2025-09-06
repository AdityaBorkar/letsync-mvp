export class Signal<T> {
  private value: T
  private callbacks: ((value: T) => void)[]

  constructor(value: T) {
    this.value = value
    this.callbacks = []
  }

  get() {
    return this.value
  }

  set(value: T) {
    this.value = value
    for (const callback of this.callbacks) {
      callback(value)
    }
  }

  onChange(callback: (value: T) => void) {
    this.callbacks.push(callback)
  }
}
