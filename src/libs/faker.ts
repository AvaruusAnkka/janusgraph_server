import { faker } from '@faker-js/faker'

export const fakePerson = () => {
  const label = 'person'
  const name = faker.person.firstName()
  const owner = name
  const group = name
  const createdAt = faker.date.past()
  const modifiedAt = faker.date.recent()
  const info = faker.person.bio()

  return { label, name, owner, group, createdAt, modifiedAt, info }
}
