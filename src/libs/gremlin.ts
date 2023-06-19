import gremlin from 'gremlin'

const traversal = gremlin.process.AnonymousTraversalSource.traversal
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const connection = new DriverRemoteConnection('ws://localhost:8182/gremlin', {
  mimeType: 'application/vnd.gremlin-v2.0+json',
})

const g = traversal().withRemote(connection)

export default class GremlinQueries {
  static check = (userId: number) => g.V(userId).hasNext()

  static getById = (userId: number) => g.V(userId).elementMap().next()

  static getAll = () => g.V().elementMap().toList()

  static add = (vertex: any) =>
    g
      .addV(vertex.label)
      .property('name', vertex.name)
      .property('group', vertex.group)
      .property('createdAt', vertex.createdAt)
      .property('modifiedAt', vertex.modifiedAt)
      .property('info', vertex.info)
      .next()

  static update = (userId: number, vertex: any) =>
    g
      .V(userId)
      .property('name', vertex.name)
      .property('group', vertex.group)
      .property('modifiedAt', new Date().toISOString())
      .property('info', vertex.info)
      .next()

  static deleteById = (userId: number) => g.V(userId).drop().next()

  static deleteAll = () => g.V().drop().next()

  static getEdges = (userId?: number) => {
    if (userId) {
      return g.V(userId).bothE().toList()
    } else return g.E().toList()
  }

  static addEdge = (from: number, to: number) =>
    g
      .V(from)
      .as('from')
      .V(to)
      .as('to')
      .addE('knows')
      .from_('from')
      .to('to')
      .next()

  static deleteEdge = (userId?: number) => g.V(userId).bothE().drop().next()

  static deleteAllEdges = () => g.E().drop().next()
}
