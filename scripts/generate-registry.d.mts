export interface RegistryPackage {
  range: string
  kind: 'runtime' | 'peer' | 'dev'
}

export interface RegistryComponent {
  files: string[]
  dependencies: string[]
  peerDependencies: string[]
  foundations: string[]
}

export interface Registry {
  schemaVersion: number
  packages: Record<string, RegistryPackage>
  foundations: {
    core: {
      files: { source: string; target: string }[]
      dependencies: string[]
      peerDependencies: string[]
      devDependencies: string[]
    }
  }
  components: Record<string, RegistryComponent>
}

export function buildRegistry(): Promise<Registry>
