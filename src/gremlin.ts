import gremlin from 'gremlin'
import 'dotenv/config'

const traversal = gremlin.process.AnonymousTraversalSource.traversal
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const url = process.env.GREMLIN_URL ? String(process.env.GREMLIN_URL) : 'ws://localhost:8182/gremlin'

const connection = new DriverRemoteConnection(url)

const g = traversal().withRemote(connection)
const client = new gremlin.driver.Client(url)

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

  clean = () => client.submit(`g.V().not(bothE()).drop().next()`)
}

class EdgeQueries {
  check = (edgeId: string) => g.E(edgeId).hasNext()

  get = (id: string) => g.E(id).next()

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
