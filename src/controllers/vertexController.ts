import GremlinQueries from '../libs/gremlin'
import { Response } from 'express'
import { IncomingHttpHeaders } from 'http'
import { fakePerson } from '../libs/faker'
import converter from '../converter'

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
    id: string | string[] | undefined,
    label: string | string[] | undefined
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
      request(res, await GremlinQueries.getVertices())
    }
  }

  static getGraphData = async (res: Response) =>
    Promise.all([GremlinQueries.getVertices(), GremlinQueries.getEdges()])
      .then((values) => {
        const nodes = values[0].map((val: any) => Object.fromEntries(val))
        const links = values[1]._items.map((val: any) =>
          Object.fromEntries(val)
        )
        request(res, { nodes: nodes, links: links })
      })
      .catch((error) => console.error(error))

  // static addVertex = async (
  //   res: Response,
  //   headers: IncomingHttpHeaders | { [key: string]: string }
  // ) => {
  //   if (headers.label) {
  //     const newVertex = new Vertex({
  //       label: headers.label,
  //       name: headers.name,
  //       owner: headers.owner,
  //       group: headers.group,
  //       info: headers.info,
  //       createdAt: new Date(),
  //       modifiedAt: new Date(),
  //     })
  //     const result = await GremlinQueries.addVertexByQuery(newVertex)
  //     request(res, result)
  //   } else res.status(400).json({ error: 'Invalid data.' })
  // }

  // static addVertex = async (
  //   res: Response,
  //   headers: IncomingHttpHeaders | { [key: string]: string }
  // ) => {
  //   if (
  //     headers.label &&
  //     headers.name &&
  //     headers.owner &&
  //     headers.group &&
  //     headers.info
  //   ) {
  //     const newVertex = new Vertex({
  //       label: headers.label,
  //       name: headers.name,
  //       owner: headers.owner,
  //       group: headers.group,
  //       info: headers.info,
  //       createdAt: new Date(),
  //       modifiedAt: new Date(),
  //     })
  //     const result = await GremlinQueries.addVertex(newVertex)
  //     request(res, result)
  //   } else res.status(400).json({ error: 'Invalid data.' })
  // }

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
        console.log(await GremlinQueries.gremlinQuery(query))
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

  static deleteVertex = async (
    res: Response,
    id: string | string[] | undefined
  ) => {
    console.log(id)
    if (Number(id)) {
      if (await GremlinQueries.checkVertexExists(Number(id))) {
        GremlinQueries.deleteVertexById(Number(id))
        res.json({ message: 'Vertex deleted.' })
      } else res.status(400).json({ error: "Vertex doesn't exist." })
    } else res.status(400).json({ error: 'Invalid id.' })
  }

  // static deleteWithoutEdge = async (res: Response) => {
  //   request(res, await GremlinQueries.deleteAllVerticesWithNoEdges())
  // }

  static getEdge = async (
    res: Response,
    vertexId?: string | string[] | undefined
  ) => {
    if (Number(vertexId))
      request(res, await GremlinQueries.getEdgeById(Number(vertexId)))
    else request(res, await GremlinQueries.getEdges())
  }

  static addEdge = (
    res: Response,
    from?: string | string[] | undefined,
    to?: string | string[] | undefined
  ) => {
    if (Number(from) && Number(to))
      request(res, GremlinQueries.addEdge(Number(from), Number(to)))
    else res.status(400).json({ error: 'Invalid data.' })
  }

  static deleteEdge = (
    res: Response,
    vertexId?: string | string[] | undefined
  ) => {
    if (Number(vertexId))
      request(res, GremlinQueries.deleteEdgeById(Number(vertexId)))
    else res.status(400).json({ error: 'Invalid data.' })
  }

  static createFake = async (
    res: Response,
    id: string | string[] | undefined
  ) => {
    const fake: { [key: string]: string | Date } = fakePerson()
    if (id)
      request(res, await GremlinQueries.addVertexByQuery(fake, Number(id)))
    else request(res, await GremlinQueries.addVertexByQuery(fake))
  }
}
