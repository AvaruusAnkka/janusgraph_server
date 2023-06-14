import Person from '../person'

const gremlin = require('gremlin')

const traversal = gremlin.process.AnonymousTraversalSource.traversal
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const {
  t: { id, label },
} = gremlin.process

const connection = new DriverRemoteConnection('ws://localhost:8182/gremlin', {
  mimeType: 'application/vnd.gremlin-v2.0+json',
})

const g = traversal().withRemote(connection)

export default class Gremlin {
  // Get all persons or a specific person by id if provided.
  static get = (userId?: number) => {
    if (userId) {
      return g.V(userId).elementMap().toList()
    } else
      return g
        .V()
        .project(
          'id',
          'label',
          'name',
          'group',
          'createdAt',
          'modifiedAt',
          'information'
        )
        .by(id)
        .by(label)
        .by('name')
        .by('group')
        .by('createdAt')
        .by('modifiedAt')
        .by('information')
        .toList()
  }

  // Add a person to the graph.
  static add = (person: Person) =>
    g
      .addV('person')
      .property('name', person.name)
      .property('group', person.group)
      .property('createdAt', person.createdAt)
      .property('modifiedAt', person.modifiedAt)
      .property('information', person.information)
      .toList()

  // Update a person by id.
  static update = (userId: number, person: Person) =>
    g
      .V(userId)
      .property('name', person.name)
      .property('group', person.group)
      .property('modifiedAt', new Date().toISOString())
      .property('information', person.information)
      .toList()

  static delete = (userId?: number) => {
    if (userId) return g.V(userId).drop().toList()
    else return g.V().drop().toList()
  }
}
