import Vertex from './vertexModel'
export default class Person extends Vertex {
  label: string = 'person'
  group: string
  name: string
  readonly createdAt: Date
  modifiedAt: Date
  info: string

  constructor({ name, group, createdAt, modifiedAt, info }: any) {
    super()
    this.name = name
    this.group = group
    this.createdAt = createdAt
    this.modifiedAt = modifiedAt
    this.info = info
  }
}
