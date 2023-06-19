import { faker } from '@faker-js/faker'

export const fakePerson = () => {
  const name = faker.person.firstName()
  const createdAt = faker.date.past()
  const modifiedAt = faker.date.recent()
  const info = faker.person.jobDescriptor()

  return { name, group: name, createdAt, modifiedAt, info }
}
