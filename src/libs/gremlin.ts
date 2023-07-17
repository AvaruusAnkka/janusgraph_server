import gremlin from 'gremlin'

const traversal = gremlin.process.AnonymousTraversalSource.traversal
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const connection = new DriverRemoteConnection(
  'ws://server.nome.fi:8182/gremlin'
)

const g = traversal().withRemote(connection)
const client = new gremlin.driver.Client('ws://server.nome.fi:8182/gremlin')

class VertexQueries {
  #createAddQuery = (vertex: object) => {
    const entries = Object.entries(vertex)
    const addQuery = entries.reduce((acc, [key, value]) => {
      if (typeof value === 'string')
        return `${acc}.property('${key}','${value}')`
      else if (typeof value === 'number')
        return `${acc}.property('${key}',${value})`
      else if (value instanceof Date)
        return `${acc}.property('${key}',new Date('${value}'))`
      else return acc
    }, '')
    return addQuery
  }

  call = (query: string) => client.submit(`g.${query}`)

  checkVertex = (vertexId: number) => g.V(vertexId).hasNext()

  get = (id: number) => g.V(id).elementMap().next()

  getAll = () => g.V().elementMap().toList()

  add = (vertex: object) => {
    const addQuery = this.#createAddQuery(vertex)
    const query = `addV('person')${addQuery}.elementMap().next()`
    return query
  }

  update = (id: number, vertex: object) => {
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

  add = (source: number, target: number) => {
    // g.addE('knows').from_(source).to(target).next()
    const query = `addE('knows').from_(V(${source})).to(V(${target}))`
    return query
  }

  delete = (id: number) => g.E(id).drop().next()
}

class GremlinQueries {
  edge = new EdgeQueries()
  vertex = new VertexQueries()
}

export default new GremlinQueries()
