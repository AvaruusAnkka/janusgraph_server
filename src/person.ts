export default class Person {
  label: string = 'person'
  group: string
  name: string
  createdAt: Date
  modifiedAt: Date
  information: string

  // constructor(
  //   name: string,
  //   group: string,
  //   createdAt: Date,
  //   modifiedAt: Date,
  //   information: string
  // ) {
  //   this.name = name
  //   this.group = group
  //   this.createdAt = createdAt
  //   this.modifiedAt = modifiedAt
  //   this.information = information
  constructor({ name, group, createdAt, modifiedAt, information }: any) {
    this.name = name
    this.group = group
    this.createdAt = createdAt
    this.modifiedAt = modifiedAt
    this.information = information
  }
  // }
}
