import { faker } from '@faker-js/faker'
import Person from '../person'

export const fakePerson = () => {
  const name = faker.person.firstName()
  const createdAt = faker.date.past()
  const modifiedAt = faker.date.recent()
  const information = faker.person.jobDescriptor()

  // return new Person(name, name, createdAt, modifiedAt, information)
  return new Person({ name, group: name, createdAt, modifiedAt, information })
}
