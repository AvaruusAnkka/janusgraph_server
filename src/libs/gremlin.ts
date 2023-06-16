import gremlin from 'gremlin'

const traversal = gremlin.process.AnonymousTraversalSource.traversal
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const connection = new DriverRemoteConnection('ws://localhost:8182/gremlin', {
  mimeType: 'application/vnd.gremlin-v2.0+json',
})

const g = traversal().withRemote(connection)

export default class Gremlin {
  // Get all vertices with their edges.
  static getAll = () => g.V().bothE().toList()

  // Get all persons or a specific person by id if provided.
  static get = (userId?: number) => {
    if (userId) {
      return g.V(userId).elementMap().toList()
    } else return g.V().elementMap().toList()
  }

  // Add a person to the graph.
  static add = (vertex: any) =>
    g
      .addV(vertex.label)
      .property('name', vertex.name)
      .property('group', vertex.group)
      .property('createdAt', vertex.createdAt)
      .property('modifiedAt', vertex.modifiedAt)
      .property('info', vertex.info)
      .toList()

  // Update a person by id.
  static update = (userId: number, vertex: any) =>
    g
      .V(userId)
      .property('name', vertex.name)
      .property('group', vertex.group)
      .property('modifiedAt', new Date().toISOString())
      .property('info', vertex.info)
      .toList()

  // Delete a person by id or all persons if id is not provided.
  static delete = (userId?: number) => {
    if (userId) return g.V(userId).drop().toList()
    else return g.V().drop().toList()
  }

  // Get all persons or a specific person by id if provided.
  static getE = (userId?: number) => {
    if (userId) {
      return g.V(userId).both()
    } else return g.E()
  }

  static addE = (from: number, to: number) =>
    g.V(from).as('from').V(to).as('to').addE('knows').from_('from').to('to')
}
