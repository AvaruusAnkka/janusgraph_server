import gremlin from 'gremlin'

const traversal = gremlin.process.AnonymousTraversalSource.traversal
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const connection = new DriverRemoteConnection(
  'ws://server.nome.fi:8182/gremlin'
)

const g = traversal().withRemote(connection)
const client = new gremlin.driver.Client('ws://server.nome.fi:8182/gremlin')

export default class GremlinQueries {
  static checkVertexExists = async (vertexId: number) => g.V(vertexId).hasNext()

  static getVertexByLabel = (label: string) =>
    g.V().hasLabel(label).elementMap().toList()

  static getVertexById = (id: number) => g.V(id).elementMap().next()

  static getAllVertices = () => g.V().elementMap().toList()

  static addVertex = (vertex: { [key: string]: string }) =>
    g
      .addV(vertex.label)
      .property('name', vertex.name)
      .property('owner', vertex.owner)
      .property('group', vertex.group)
      .property('info', vertex.info)
      .property('createdAt', vertex.createdAt)
      .property('modifiedAt', vertex.modifiedAt)
      .next()

  static updateVertex = (vertexId: number, properties: any) =>
    g
      .V(vertexId)
      .property('name', properties.name)
      .property('group', properties.group)
      .property('modifiedAt', new Date().toISOString())
      .property('info', properties.info)
      .next()

  static deleteVertexById = (vertexId: number) => g.V(vertexId).drop().next()

  static deleteAllVertices = () => g.V().drop().next()

  static getEdgeById = (vertexId: number) => g.V(vertexId).bothE().toList()

  static getAllEdges = () => g.E().elementMap().toList()

  static addEdge = (from: number, to: number) =>
    g.V(from).as('from').V(to).addE('knows').from_('from').next()

  static deleteEdge = (vertexId: number) => g.V(vertexId).bothE().drop().next()

  static deleteAllEdges = () => g.E().drop().next()
}

export class QueryCalss {
  static gremlinQuery = (query: string) => client.submit(query)

  static getAllLinks = (id: number) => {
    const query = `g.V(${id}).emit().repeat(out('knows')).until(out().count().is(0)).elementMap()`
    return client.submit(query)
  }

  static addVertexByQuery = (
    vertex: { [key: string]: string },
    id?: number
  ) => {
    const keys = Object.keys(vertex).filter((key) => key !== 'label')
    const addQuery: string = keys
      .map((key) => `property('${key}', '${vertex[key]}')`)
      .join('')

    let destination = `V().has('name', 'Andy')`
    if (id) destination = `V(${id})`

    const query = `g.addV('${vertex.label}')${addQuery}.addE('knows').from(${destination}).next()`

    return client.submit(query)
  }

  static deleteAllVerticesWithNoEdges = () =>
    client.submit('g.V().not(bothE()).drop()')
}
