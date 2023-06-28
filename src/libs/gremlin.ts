import gremlin from 'gremlin'
import Vertex from '../models/vertexModel'

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

  static addVertexByQuery = (vertex: { [key: string]: string | Date }) => {
    const keys = Object.keys(vertex).filter((key) => key !== 'label')
    const addQuery: string = keys
      .map((key) => {
        let keyValue: string | number
        if (vertex[key] instanceof Date)
          keyValue = (vertex as { [key: string]: Date })[key].getTime()
        else keyValue = (vertex as { [key: string]: string })[key]
        return `.property('${key}', '${keyValue}')`
      })
      .join('')
    const query = `g.addV('${vertex.label}')${addQuery}.addE('knows').from(V().has('name', 'Andy')).next()`
    console.log(query)

    return client.submit(query)
  }

  static gremlinQuery = (query: string) => {
    return client.submit(query)
  }

  static addVertex = (vertex: Vertex) =>
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

  static deleteAllVerticesWithNoEdges = () =>
    this.gremlinQuery('g.V().not(bothE()).drop()')

  static getEdgeById = (vertexId: number) => g.V(vertexId).bothE().toList()

  static getAllEdges = () => g.E().elementMap().toList()

  static addEdge = (from: number, to: number) =>
    g.V(from).as('from').V(to).addE('knows').from_('from').next()

  static deleteEdge = (vertexId: number) => g.V(vertexId).bothE().drop().next()

  static deleteAllEdges = () => g.E().drop().next()
}
