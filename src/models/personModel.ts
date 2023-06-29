import Vertex from './vertexModel'

export default class Person extends Vertex {
  label: string = 'person'

  owner: string
  group: string
  additional?: { [key: string]: string }

  constructor(
    name: string,
    uuid: string,
    owner: string,
    group: string,
    createDate: Date,
    modifyDate: Date,
    additional?: { [key: string]: string }
  ) {
    super('person', name, uuid, createDate, modifyDate)
    this.owner = owner
    this.group = group
    this.additional = additional
  }
}
