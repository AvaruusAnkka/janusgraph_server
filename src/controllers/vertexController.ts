import GremlinQueries from '../libs/gremlin'
import converter from '../converter'
import request from '../index'
import { IncomingHttpHeaders } from 'http'
import { Response } from 'express'
import { fakePerson } from '../libs/faker'

const headerFilter = [
  'accept',
  'accept-encoding',
  'cache-control',
  'connection',
  'content-length',
  'host',
  'postman-token',
  'user-agent',
]

class VertexController {
  getVertex = async (
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

  getGraphData = async (res: Response) =>
    Promise.all([GremlinQueries.getVertices(), GremlinQueries.getEdges()])
      .then((values) => {
        const nodes = values[0].map((val: any) => Object.fromEntries(val))
        const links = values[1]._items.map((val: any) =>
          Object.fromEntries(val)
        )
        request(res, { nodes: nodes, links: links })
      })
      .catch((error) => console.error(error))

  updateVertex = async (res: Response, headers: IncomingHttpHeaders) => {}

  deleteVertex = async (res: Response, id: string | string[] | undefined) => {
    console.log(id)
    if (Number(id)) {
      if (await GremlinQueries.checkVertexExists(Number(id))) {
        GremlinQueries.deleteVertexById(Number(id))
        res.json({ message: 'Vertex deleted.' })
      } else res.status(400).json({ error: "Vertex doesn't exist." })
    } else res.status(400).json({ error: 'Invalid id.' })
  }

  createFake = async (res: Response, id: string | string[] | undefined) => {
    const fake: { [key: string]: string | Date } = fakePerson()
    if (id)
      request(res, await GremlinQueries.addVertexByQuery(fake, Number(id)))
    else request(res, await GremlinQueries.addVertexByQuery(fake))
  }
}

export default new VertexController()
