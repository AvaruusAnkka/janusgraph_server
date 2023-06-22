export default class Vertex {
  label: string
  name: string
  owner: string
  group: string
  readonly createdAt: Date
  modifiedAt: Date
  info: string

  constructor({ label, name, owner, group, createdAt, modifiedAt, info }: any) {
    this.label = label
    this.name = name
    this.owner = owner
    this.group = group
    this.createdAt = createdAt
    this.modifiedAt = modifiedAt
    this.info = info
  }
}
