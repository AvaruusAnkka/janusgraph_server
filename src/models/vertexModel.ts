export default class Vertex {
  label: string
  name: string
  uuid: string
  createDate: Date
  modifyDate: Date

  constructor(
    label: string,
    name: string,
    uuid: string,
    createDate: Date,
    modifyDate: Date
  ) {
    this.label = label
    this.name = name
    this.uuid = uuid
    this.createDate = createDate
    this.modifyDate = modifyDate
  }
}
