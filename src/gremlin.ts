import gremlin from 'gremlin'

const traversal = gremlin.process.AnonymousTraversalSource.traversal
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const connection = new DriverRemoteConnection(
  'ws://server.nome.fi:8182/gremlin'
)

const g = traversal().withRemote(connection)
const client = new gremlin.driver.Client('ws://server.nome.fi:8182/gremlin')

class VertexQueries {
  #ignoredKeys = new RegExp(/^(id|label)$/, 'i')

  #createAddQuery = (vertex: { [key: string]: string | number }) => {
    const entries = Object.entries(vertex)
    const addQuery = entries.map(([key, value]) => {
      if (this.#ignoredKeys.test(key)) return ''
      else if (typeof value === 'string')
        return `.property('${key}','${value}')`
      else if (typeof value === 'number') return `.property('${key}',${value})`
    })
    return addQuery.join('')
  }

  check = (vertexId: number) => g.V(vertexId).hasNext()

  get = (id: number) => g.V(id).elementMap().next()

  getAll = () => g.V().elementMap().toList()

  add = (vertex: { [key: string]: string | number }) => {
    const addQuery = this.#createAddQuery(vertex)
    const query = `addV('${vertex.label}')${addQuery}.next()`
    return client.submit(`g.${query}`)
  }

  update = (vertex: { [key: string]: string | number }) => {
    const addQuery = this.#createAddQuery(vertex)
    const query = `V(${vertex.id})${addQuery}.next()`
    return client.submit(`g.${query}`)
  }

  delete = (vertexId: number) => g.V(vertexId).drop().next()

  drop = () => g.V().drop().next()

  clean = () => client.submit( `g.V().not(bothE()).drop().next()` )
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
