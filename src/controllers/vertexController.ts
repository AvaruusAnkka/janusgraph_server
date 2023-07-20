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

  getOne = async (res: Response, id: string | string[] | undefined) => {
    if (Number(id)) {
      const vertex = await this.#vertex.get(Number(id))
      if (vertex.value) request(res, [vertex.value])
      else res.status(400).json({ error: "Vertex doesn't exist." })
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  getAll = async () => {
    const vertices: any = await this.#vertex.getAll()
    return vertices.map((val: any) => Object.fromEntries(val))
  }

  add = async (res: Response, headers: string) => {
    const headerObject = JSON.parse(headers)

    if (headers.includes('label')) {
      const label = headerObject.label
      const vertex: { [key: string]: any } = {}
      Object.entries(headerObject).forEach(([key, value]) => {
        if (!headerFilter.includes(key) && !key.includes('label'))
          vertex[key] = value
      })
      vertex.createdAt = new Date()
      vertex.updatedAt = new Date()
      const query =
        this.#vertex.add(label, vertex) + GremlinQueries.edge.add(1, 1)

      request(res, await this.#vertex.call(query))
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  update = async (res: Response, headers: string) => {
    const headerObject = JSON.parse(headers)

    if (headers.includes('id')) {
      const id = headerObject.id
      const vertex: { [key: string]: any } = {}
      Object.entries(headerObject).forEach(([key, value]) => {
        if (!headerFilter.includes(key) && !key.includes('id'))
          vertex[key] = value
      })
      vertex.updatedAt = new Date()
      request(res, await this.#vertex.update(id, vertex))
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  delete = async (res: Response, id: string | string[] | undefined) => {
    if (Number(id)) {
      const vertex = await this.#vertex.delete(Number(id))
      if (vertex.value) request(res, [vertex.value])
      else res.status(400).json({ error: "Vertex doesn't exist." })
    }
  }
}

export default new VertexController()
