import GremlinQueries, { QueryCalss } from '../libs/gremlin'
import { Response } from 'express'
import { IncomingHttpHeaders } from 'http'
import { fakePerson } from '../libs/faker'
import converter from '../converter'
import { v4 as uuidv4 } from 'uuid'

const request = async (res: Response, result: object | object[]) => {
  try {
    if (Array.isArray(result)) {
      const asObject = result.map((val: any) => Object.fromEntries(val))
      if (asObject.length === 1) {
        console.log('asObject[0]', asObject[0])
        return res.json(asObject[0])
      } else {
        console.log('asObject', asObject)
        return res.json(asObject)
      }
    } else {
      console.log('result', result)
      return res.json(result)
    }
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

  static getLinks = async (
    res: Response,
    id: string | string[] | undefined
  ) => {
    if (Number(id)) {
      const vertex = await GremlinQueries.getVertexById(Number(id))
      if (vertex.value) {
        const response: any = await QueryCalss.getAllLinks(Number(id))
        // console.log(response)
        request(res, response)
      } else res.status(400).json({ error: "Vertex doesn't exist." })
    } else res.status(400).json({ error: 'Invalid id.' })
  }

  static addVertex = async (
    res: Response,
    headers: IncomingHttpHeaders | { [key: string]: string }
  ) => {
    if (headers.label) {
      const newVertex = {
        label: String(headers.label),
        name: String(headers.name),
        uuid: uuidv4(),
        owner: String(headers.name).toLocaleLowerCase(),
        group: 'andy',
        createDate: String(new Date().getTime()),
        modifyDate: String(new Date().getTime()),
      }
      const result = await QueryCalss.addVertexByQuery(newVertex)
      request(res, result)
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  static updateVertex = async (res: Response, headers: IncomingHttpHeaders) => {
    if (Number(headers.id)) {
      if (await GremlinQueries.checkVertexExists(Number(headers.id))) {
        const properties = Object.keys(headers).filter(
          (key) => !headerFilter.includes(key)
        )
        const newProperties: { [key: string]: string } = {}
        // for (const key of properties) {
        //   newProperties[key] = String(headers[key])
        // }
        properties.forEach((key) => (newProperties[key] = String(headers[key])))
        console.log(newProperties)
        const query: string = `g.V(${Number(headers.id)}).elementMap().toList()`
        console.log(await QueryCalss.gremlinQuery(query))
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

  static deleteWithoutEdge = async (res: Response) => {
    request(res, await QueryCalss.deleteAllVerticesWithNoEdges())
  }

  static createFake = async (
    res: Response,
    id: string | string[] | undefined
  ) => {
    const fake = fakePerson()
    if (Number(id))
      request(res, await QueryCalss.addVertexByQuery(fake, Number(id)))
    else request(res, await QueryCalss.addVertexByQuery(fake))
  }
}
