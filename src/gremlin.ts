import gremlin from 'gremlin'
import 'dotenv/config'

const traversal = gremlin.process.AnonymousTraversalSource.traversal
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const url = process.env.GREMLIN_URL
  ? String(process.env.GREMLIN_URL)
  : 'ws://localhost:8182/gremlin'

const connection = new DriverRemoteConnection(url)

const g = traversal().withRemote(connection)
const client = new gremlin.driver.Client(url)

class Utils {
  submit = async (query: string) => {
    try {
      console.log('Query:', query)
      const response = await client.submit(`g.${query}`)
      return response
    } catch (error) {
      console.error('Error executing Gremlin query:', error)
      return { error: 'Something went wrong.' }
    }
  }

  searchQuery = (properties: { [key: string]: string }) => {
    const entries = Object.entries(properties)
    const addQuery = entries.map(([key, value]) => {
      if (key === 'id') return `.hasId(${value})`
      else if (key === 'label') return `.hasLabel('${value}')`
      else if (Number(value)) return `.has('${key}', ${value})`
      else return `.has('${key}', '${value}')`
    })
    return addQuery.join('')
  }

  #ignoredKeys = new RegExp(/^(id|label|to|from)$/, 'i')

  createAddQuery = (properties: { [key: string]: string }) => {
    const entries = Object.entries(properties)
    const addQuery = entries.map(([key, value]) => {
      if (this.#ignoredKeys.test(key)) return ''
      else if (Number(value)) return `.property('${key}',${value})`
      else return `.property('${key}','${value}')`
    })
    return addQuery.join('')
  }
}

class VertexQueries extends Utils {
  get = async (properties: { [key: string]: string }) => {
    const query = `V()${this.searchQuery(properties)}.elementMap().toList()`
    const vertices = (await this.submit(query))._items
    return vertices.map((vertex: any) => Object.fromEntries(vertex))
  }

  add = async (properties: { [key: string]: string }) => {
    const label = properties.label ? properties.label : 'vertex'
    const query = `addV('${label}')${this.createAddQuery(properties)}.next()`
    return (await this.submit(query))._items[0]
  }

  update = async (properties: { [key: string]: string }) => {
    const addQuery = this.createAddQuery(properties)
    const query = `V(${properties.id})${addQuery}.next()`
    return (await this.submit(query))._items
  }

  delete = async (id: number) => await g.V(id).drop().next()

  drop = async () => await g.V().drop().next()
}

class EdgeQueries extends Utils {
  #converter = (map: Map<string, any>) => {
    const result: { [key: string]: any } = {}

    for (const [key, value] of map.entries()) {
      if (value instanceof Map) {
        result[key] = this.#converter(value)
      } else {
        result[key] = value
      }
    }
    return result
  }

  get = async (properties: { [key: string]: string }) => {
    const query = `E()${this.searchQuery(properties)}.elementMap().toList()`
    const response = (await this.submit(query))._items
    return response.map((edge: any) => this.#converter(edge))
  }

  add = async (property: { [key: string]: string }) => {
    const label = property.label ? property.label : 'out'
    const query = `V(${property.from}).addE('${label}').to(V(${
      property.to
    }))${this.createAddQuery(property)}.next()`
    return await this.submit(query)
  }

  delete = (id: string) => g.E(id).drop().next()
}

class GremlinQueries {
  edge = new EdgeQueries()
  vertex = new VertexQueries()
}

export default new GremlinQueries()
