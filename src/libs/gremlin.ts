import gremlin from 'gremlin'

const traversal = gremlin.process.AnonymousTraversalSource.traversal
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const connection = new DriverRemoteConnection(
  'ws://server.nome.fi:8182/gremlin'
)

const g = traversal().withRemote(connection)

export default class GremlinQueries {
  static checkVertex = (vertexId: number) => g.V(vertexId).hasNext()

  static getVertex = (vertexId: number) => g.V(vertexId).elementMap().next()

  static getVertices = () => g.V().elementMap().toList()

  static addVertex = (vertex: any) =>
    g
      .addV(vertex.label)
      .property('name', vertex.name)
      .property('owner', vertex.owner)
      .property('group', vertex.group)
      .property('createdAt', vertex.createdAt)
      .property('modifiedAt', vertex.modifiedAt)
      .property('info', vertex.info)

  static updateVertex = (vertexId: number, properties: any) =>
    g
      .V(vertexId)
      .property('name', properties.name)
      .property('group', properties.group)
      .property('modifiedAt', new Date().toISOString())
      .property('info', properties.info)
      .next()

  static deleteVertex = (vertexId: number) => g.V(vertexId).drop().next()

  static deleteVertices = () => g.V().drop().next()

  static checkEdge = (edgeId: number) => g.V(edgeId).bothE().hasNext()

  static checkEdgeBetweenVertices = (from: number, to: number) =>
    g.V(from).outE().where(g.V(to)).hasNext()

  static getEdge = (vertexId: number) =>
    g.V(vertexId).bothE().elementMap().toList()

  static getEdges = () => g.E().elementMap().toList()

  static addEdge = (from: number, to: number) =>
    g.V(from).as('from').V(to).addE('knows').from_('from').next()

  static deleteEdge = (vertexId: number) => g.V(vertexId).bothE().drop().next()

  static deleteEdges = () => g.E().drop().next()
}
