import GremlinQueries from '../libs/gremlin'
import { Response } from 'express'
import { IncomingHttpHeaders } from 'http'
import Vertex from '../models/vertexModel'
import { fakePerson } from '../libs/faker'

const request = async (res: Response, result: object[] | object) => {
  try {
    // try {
    if (Array.isArray(result)) {
      const asObject = result.map((val: any) => Object.fromEntries(val))
      if (asObject.length === 1) res.json(asObject[0])
      else res.json(asObject)
    } else res.json(result)
    // } catch {
    //   console.log('Error parsing result to JSON.')
    // }
  } catch (error) {
    console.error('Error executing Gremlin query:', error)
    res.status(500).json({ error: 'Something went wrong.' })
  }
}

const headerFilter = [
  'user-agent',
  'accept',
  'cache-control',
  'postman-token',
  'host',
  'accept-encoding',
  'connection',
  'content-length',
]

export default class VertexController {
  static getVertex = async (
    res: Response,
    id: string | string[] | undefined
  ) => {
    if (Number(id)) {
      const vertex = await GremlinQueries.getVertexById(Number(id))
      if (vertex.value) request(res, [vertex.value])
      else res.status(400).json({ error: "Vertex doesn't exist." })
    } else {
      request(res, await GremlinQueries.getAllVertices())
    }
  }

  static addVertex = async (
    res: Response,
    headers: IncomingHttpHeaders | { [key: string]: string }
  ) => {
    if (
      headers.label &&
      headers.name &&
      headers.owner &&
      headers.group &&
      headers.info
    ) {
      const newVertex = new Vertex({
        label: headers.label,
        name: headers.name,
        owner: headers.owner,
        group: headers.group,
        info: headers.info,
        createdAt: new Date(),
        modifiedAt: new Date(),
      })
      const result = await GremlinQueries.addVertex(newVertex)
      request(res, result)
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  static addFake = async (res: Response) =>
    request(res, await GremlinQueries.addVertex(fakePerson()))

  static updateVertex = async (res: Response, headers: IncomingHttpHeaders) => {
    if (Number(headers.id)) {
      if (await GremlinQueries.checkVertexExists(Number(headers.id))) {
        const properties = Object.keys(headers).filter(
          (key) => !headerFilter.includes(key)
        )
        const newProperties: { [key: string]: string } = {}
        for (const key of properties) {
          newProperties[key] = String(headers[key])
        }
        console.log(newProperties)
        console.log(await GremlinQueries.gremlinQuery())
        //     const person = new Person(
        //       await VertexController.getVertex(Number(req.headers.id))
        //     )
        //     if (req.headers.name) person.name = String(req.headers.name)
        //     if (req.headers.group) person.group = String(req.headers.group)
        //     if (req.headers.info) person.info = String(req.headers.info)
        //     request(res, () =>
        //       VertexController.updateVertex(Number(req.headers.id), person)
        // )
        //   } else res.status(400).json({ error: "Vertex doesn't exist." })
        // } else res.status(400).json({ error: 'Invalid id.' })
      }
    }
    res.json('test')
  }

  static deleteVertex = (vertexId?: number): any => {
    if (vertexId) return GremlinQueries.deleteVertexById(vertexId)
    else return GremlinQueries.deleteAllVertices()
  }

  static getEdge = (vertexId?: number) => {
    if (vertexId) {
      return GremlinQueries.getEdgeById(vertexId)
    } else return GremlinQueries.getAllEdges()
  }

  static addEdge = (from: number, to: number) =>
    GremlinQueries.addEdge(from, to)

  static deleteEdge = (vertexId?: number) => {
    if (vertexId) return GremlinQueries.deleteEdge(vertexId)
    else return GremlinQueries.deleteAllEdges()
  }
}
