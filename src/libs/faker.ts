import { faker } from '@faker-js/faker'

export const fakePerson = () => {
  const name = faker.person.firstName()

  return {
    label: 'person',
    name: name,
    uuid: faker.string.uuid(),
    owner: name,
    group: 'andy',
    createDate: String(faker.date.past().getTime()),
    modifyDate: String(faker.date.recent().getTime()),
  }
}
