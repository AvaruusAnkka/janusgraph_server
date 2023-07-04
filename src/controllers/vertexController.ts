import GremlinQueries, { QueryCalls } from '../libs/gremlin'
import { Response } from 'express'
import { IncomingHttpHeaders } from 'http'
import { fakePerson } from '../libs/faker'
import converter from '../converter'
import { v4 as uuidv4 } from 'uuid'
import { he } from '@faker-js/faker'

const request = async (res: Response, result: object | object[]) => {
  try {
    if (Array.isArray(result)) {
      const asObject = result.map((val: any) => Object.fromEntries(val))
      if (asObject.length === 1) {
        res.json(asObject[0])
      } else {
        res.json(asObject)
      }
    } else res.json(result)
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
    id?: string | string[] | undefined,
    label?: string | string[] | undefined
  ) => {
    if (Number(id)) {
      const vertex = await GremlinQueries.getVertexById(Number(id))
      if (vertex.value) request(res, [vertex.value])
      else res.status(400).json({ error: "Vertex doesn't exist." })
    } else if (label) {
      const response: any = await GremlinQueries.getVertexByLabel(String(label))
      converter(response)
      request(res, response)
    } else {
      request(res, await GremlinQueries.getAllVertices())
    }
  }

  static getSelection = async (res: Response, headers: IncomingHttpHeaders) => {
    if (Number(headers.id)) {
      if (await GremlinQueries.checkVertexExists(Number(headers.id))) {
        const response: any = await QueryCalls.getVerticesBySelection()
        res.json('ok')
      } else res.status(400).json({ error: "Vertex doesn't exist." })
    } else res.status(400).json({ error: 'Invalid id.' })
  }

  static addVertex = async (res: Response, headers: IncomingHttpHeaders) => {
    if (String(headers.label)) {
      const keys = Object.keys(headers).filter(
        (key) => !headerFilter.includes(key)
      )
      const newVertex = {}
      keys.forEach((key) => Object.assign(newVertex, { [key]: headers[key] }))
      Object.assign(newVertex, {
        uuid: uuidv4(),
        createDate: new Date().getTime(),
        modifyDate: new Date().getTime(),
      })
      request(res, await QueryCalls.addVertexByQuery(newVertex))
    } else res.status(400).json({ error: 'Invalid label.' })
  }

  static selectVertex = async (res: Response, headers: IncomingHttpHeaders) => {
    let query: string = ''
    if (Number(headers.id)) {
      query = `g.V(${Number(headers.id)}).elementMap().toList()`
      if (String(headers.edge) === 'in') {
        query = `g.V(${Number(headers.id)}).in('${String(
          headers.edge
        )}').elementMap().toList()`
      } else if (String(headers.edge) === 'out') {
        query = `g.V(${Number(headers.id)}).out('${String(
          headers.edge
        )}').elementMap().toList()`
      } else if (String(headers.edge) === 'both') {
        query = `g.V(${Number(headers.id)}).both('${String(
          headers.edge
        )}').elementMap().toList()`
      }
      const response = await QueryCalls.gremlinQuery(query)
      console.log(response)
      request(res, response)
    } else res.status(400).json({ error: 'Invalid id.' })
  }

  static updateVertex = async (res: Response, headers: IncomingHttpHeaders) => {
    if (Number(headers.id)) {
      if (await GremlinQueries.checkVertexExists(Number(headers.id))) {
        const keys = Object.keys(headers).filter(
          (key) =>
            !headerFilter.includes(key) && !['createDate', 'uuid'].includes(key)
        )
        const updatedVertex = {}
        keys.forEach((key) =>
          Object.assign(updatedVertex, { [key]: headers[key] })
        )
        Object.assign(updatedVertex, { modifyDate: new Date().getTime() })
        request(
          res,
          await QueryCalls.updateVertexByQuery(
            updatedVertex,
            Number(headers.id)
          )
        )
      } else res.status(400).json({ error: "Vertex doesn't exist." })
    } else res.status(400).json({ error: 'Invalid id.' })
  }

  static deleteVertex = (vertexId?: number): any => {
    if (vertexId) return GremlinQueries.deleteVertexById(vertexId)
    else return GremlinQueries.deleteAllVertices()
  }

  static deleteWithoutEdge = async (res: Response) => {
    request(res, await QueryCalls.deleteAllVerticesWithNoEdges())
  }

  static createFake = async (
    res: Response,
    id: string | string[] | undefined
  ) => {
    const fake = fakePerson()
    if (Number(id)) {
      if (await GremlinQueries.checkVertexExists(Number(id)))
        request(res, await QueryCalls.addVertexByQuery(fake, Number(id)))
      else res.status(400).json({ error: "Vertex doesn't exist." })
    } else request(res, await QueryCalls.addVertexByQuery(fake))
  }
}
