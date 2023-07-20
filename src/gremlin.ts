import gremlin from 'gremlin'

const traversal = gremlin.process.AnonymousTraversalSource.traversal
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const connection = new DriverRemoteConnection(
  'ws://server.nome.fi:8182/gremlin'
)

const g = traversal().withRemote(connection)
const client = new gremlin.driver.Client('ws://server.nome.fi:8182/gremlin')

class VertexQueries {
  #createAddQuery = (vertex: { [key: string]: any }) => {
    const entries = Object.entries(vertex)
    const addQuery = entries.map(([key, value]) => {
      if (typeof value === 'string') return `.property('${key}','${value}')`
      else if (typeof value === 'number') return `.property('${key}',${value})`
      else if (value instanceof Date)
        return `.property('${key}',${value.getTime()})`
    })
    return addQuery.join('')
  }

  check = (vertexId: number) => g.V(vertexId).hasNext()

  get = (id: number) => g.V(id).elementMap().next()

  getAll = () => g.V().elementMap().toList()

  add = (label: string, vertex: { [key: string]: any }) => {
    const addQuery = this.#createAddQuery(vertex)
    const query = `addV('${label}')${addQuery}.next()`
    return client.submit(`g.${query}`)
  }

  update = (id: number, vertex: { [key: string]: any }) => {
    const addQuery = this.#createAddQuery(vertex)
    const query = `V(${id})${addQuery}.next()`
    return client.submit(`g.${query}`)
  }

  delete = (vertexId: number) => g.V(vertexId).drop().next()
}

class EdgeQueries {
  check = (edgeId: string) => g.E(edgeId).hasNext()

  get = (id: string) => g.E(id).next()

  getAll = () => g.E().elementMap().toList()

  getLinks = () => {
    const query = `E().project('id','source', 'target').by(id()).by(outV().id()).by(inV().id()).toList()`
    return client.submit(`g.${query}`)
  }

  add = (source: number, target: number, label: string = 'superior') =>
    client.submit(
      `g.addE('${label}').from(V(${source})).to(V(${target})).next()`
    )

  delete = (id: string) => g.E(id).drop().next()
}

class GremlinQueries {
  edge = new EdgeQueries()
  vertex = new VertexQueries()
}

export default new GremlinQueries()
