export interface OrmConfig {
  config: {
    fileName: string
    schema: Type<any, any>
  }
  methods: {
    generate: (config: any, options: { dryRun: boolean }) => Promise<void>
    // push: (config: any, options: { dryRun: boolean }) => Promise<void>
    migrate: (config: any, options: { dryRun: boolean }) => Promise<void>
  }
}
