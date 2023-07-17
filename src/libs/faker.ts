import { faker } from '@faker-js/faker'

const fakePerson = () => {
  const name = faker.person.firstName()

  return {
    label: 'person',
    name: name,
    owner: name,
    group: name,
    uuid: faker.string.uuid(),
    createdAt: faker.date.past(),
    modifiedAt: faker.date.recent(),
    info: faker.person.jobDescriptor(),
  }
}

export default fakePerson
