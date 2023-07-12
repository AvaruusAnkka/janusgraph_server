import gremlin from 'gremlin'

const traversal = gremlin.process.AnonymousTraversalSource.traversal
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const connection = new DriverRemoteConnection(
  'ws://server.nome.fi:8182/gremlin'
)

const g = traversal().withRemote(connection)
const client = new gremlin.driver.Client('ws://server.nome.fi:8182/gremlin')

class GremlinQueries {
  gremlinQuery = (query: string) => client.submit(`g.${query}`)

  checkVertexExists = (vertexId: number) => g.V(vertexId).hasNext()

  getVertexByLabel = (label: string) =>
    g.V().hasLabel(label).elementMap().toList()

  getVertexById = (id: number) => g.V(id).elementMap().next()

  getVertices = () => g.V().elementMap().toList()

  addVertexByQuery = (
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
    const query = `addV('${vertex.label}')${addQuery}.addE('knows').from(${target}).next()`
    console.log(query)

    return this.gremlinQuery(query)
  }

  deleteVertexById = (vertexId: number) => g.V(vertexId).drop().next()

  getEdges = () => {
    const query = `E().project('id','source', 'target').by(id()).by(outV().id()).by(inV().id()).toList()`
    return this.gremlinQuery(query)
  }

  getEdgeById = (id: number) => {
    const query = `g.E(${id}).project('id','source', 'target').by(id()).by(outV().id()).by(inV().id()).toList()`
    return client.submit(query)
  }

  addEdge = (source: number, target: number) => {
    const query = `V(${source}).addE('knows').to(g.V(${target})).next()`
    return this.gremlinQuery(query)
  }

  deleteEdgeById = (id: number) => g.E(id).drop().next()
}

export default new GremlinQueries()
