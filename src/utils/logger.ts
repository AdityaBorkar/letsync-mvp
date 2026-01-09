type LoggerProps = { color: string; prefix: string }

export class Logger {
  private readonly getConfig?: () => LoggerProps
  private readonly props?: LoggerProps

  constructor(props: LoggerProps | (() => LoggerProps)) {
    if (typeof props === "function") {
      this.getConfig = props
    } else {
      this.props = props
    }
  }

  warn(title: string, ...messages: unknown[]) {
    console.warn(...this.render(title, ...messages))
  }

  error(title: string, ...messages: unknown[]) {
    console.error(...this.render(title, ...messages))
  }

  log(title: string, ...messages: unknown[]) {
    console.log(...this.render(title, ...messages))
  }

  private render(...msgs: unknown[]) {
    // TODO: Make coloring compatible with server-side
    const { color, prefix } = this.getConfig?.() ??
      this.props ?? { color: "#fff", prefix: "Letsync Logger" }
    return [
      `%c[${prefix}]`,
      `background-color: ${color}; color: #000;`,
      ...msgs
    ]
  }

  // TODO: Support Traces and Context
  // TODO: Support Single Log File Format
}
