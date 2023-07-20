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
    const addQuery = entries.reduce((acc, [key, value]) => {
      if (typeof value === 'string')
        return `${acc}.property('${key}','${value}')`
      else if (typeof value === 'number')
        return `${acc}.property('${key}',${value})`
      else if (value instanceof Date)
        return `${acc}.property('${key}',${value.getTime()})`
      else return acc
    }, '')
    return addQuery
  }

  call = (query: string) => client.submit(`g.${query}`)

  checkVertex = (vertexId: number) => g.V(vertexId).hasNext()

  get = (id: number) => g.V(id).elementMap().next()

  getAll = () => g.V().elementMap().toList()

  add = (label: string, vertex: { [key: string]: any }) => {
    const addQuery = this.#createAddQuery(vertex)
    const query = `addV(${label})${addQuery}.elementMap().next()`
    return query
  }

  update = (id: number, vertex: { [key: string]: any }) => {
    const addQuery = this.#createAddQuery(vertex)
    const query = `V(${id})${addQuery}.elementMap().next()`
    return this.call(query)
  }

  delete = (vertexId: number) => g.V(vertexId).drop().next()
}

class EdgeQueries {
  call = (query: string) => client.submit(`g.${query}`)

  get = (id: number) => g.E(id).elementMap().next()

  getLinks = () => {
    const query = `E().project('id','source', 'target').by(id()).by(outV().id()).by(inV().id()).toList()`
    return this.call(query)
  }

  add = (source: number, target: number, label: string = 'superior') => {
    let query = `.addE(${label}).to(V(${target}))`
    if (source) query = `.addE(${label}).from_(V(${source})).to(V(${target}))`
    return query
  }

  delete = (id: number) => g.E(id).drop().next()
}

class GremlinQueries {
  edge = new EdgeQueries()
  vertex = new VertexQueries()
}

export default new GremlinQueries()
