import gremlin from 'gremlin'

const traversal = gremlin.process.AnonymousTraversalSource.traversal
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const connection = new DriverRemoteConnection(
  'ws://server.nome.fi:8182/gremlin'
)

const g = traversal().withRemote(connection)
const client = new gremlin.driver.Client('ws://server.nome.fi:8182/gremlin')

export default class GremlinQueries {
  static gremlinQuery = (query: string) => {
    return client.submit(query)
  }

  static checkVertexExists = async (vertexId: number) => g.V(vertexId).hasNext()

  static getVertexByLabel = (label: string) =>
    g.V().hasLabel(label).elementMap().toList()

  static getVertexById = (id: number) => g.V(id).elementMap().next()

  static getVertices = () => g.V().elementMap().toList()

  static getEdges = () => {
    const query = `g.E().project('id','source', 'target').by(id()).by(outV().id()).by(inV().id()).toList()`
    return client.submit(query)
  }

  static getEdgeById = (id: number) => {
    const query = `g.E(${id}).project('id','source', 'target').by(id()).by(outV().id()).by(inV().id()).toList()`
    return client.submit(query)
  }

  static addVertexByQuery = (
    vertex: { [key: string]: string | Date },
    id?: number
  ) => {
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

    let target = `V().has('name', 'Andy')`
    if (id) target = `V(${id})`
    const query = `g.addV('${vertex.label}')${addQuery}.addE('knows').from(${target}).next()`
    console.log(query)

    return client.submit(query)
  }

  static deleteVertexById = (vertexId: number) => g.V(vertexId).drop().next()

  static addEdge = (from: number, to: number) =>
    g.V(from).as('from').V(to).addE('knows').from_('from').next()

  static deleteEdgeById = (id: number) => g.E(id).drop().next()
}
