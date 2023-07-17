import GremlinQueries from '../libs/gremlin'
import request from '../index'
import { Response } from 'express'

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
  #vertex = GremlinQueries.vertex

  get = async (res: Response, id: string | string[] | undefined) => {
    if (Number(id)) {
      const vertex = await this.#vertex.get(Number(id))
      if (vertex.value) request(res, [vertex.value])
      else res.status(400).json({ error: "Vertex doesn't exist." })
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  getAll = async (res: Response) => {
    const vertices: any = await this.#vertex.getAll()
    request(
      res,
      vertices.map((val: any) => Object.fromEntries(val))
    )
  }

  getNodes = async () => {
    const nodes = await this.#vertex.getAll()
    return nodes.map((val: any) => Object.fromEntries(val))
  }

  add = async (res: Response, headers: string) => {
    const headerObject = JSON.parse(headers)
    const filteredHeaders = Object.entries(headerObject).filter(
      ([key]) => !headerFilter.includes(key)
    )
    const query = this.#vertex.add(filteredHeaders)
    if (query) request(res, this.#vertex.call(query))
    else res.status(400).json({ error: 'Invalid data.' })
  }

  update = async (res: Response, headers: string) => {}

  delete = async (res: Response, id: string | string[] | undefined) => {
    if (Number(id)) {
      const vertex = await this.#vertex.delete(Number(id))
      if (vertex.value) request(res, [vertex.value])
      else res.status(400).json({ error: "Vertex doesn't exist." })
    }
  }
}

export default new VertexController()
