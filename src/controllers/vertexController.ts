import GremlinQueries from '../gremlin'
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
    return vertices.map((vertex: any) => Object.fromEntries(vertex))
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
      request(res, await this.#vertex.add(label, vertex))
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  update = async (res: Response, headers: string) => {
    const headerObject = JSON.parse(headers)

    if (headers.includes('id')) {
      const id = headerObject.id
      const uuid = headerObject.uuid
      const vertex: { [key: string]: any } = {}
      Object.entries(headerObject).forEach(([key, value]) => {
        if (
          !headerFilter.includes(key) &&
          !key.includes('id') &&
          !key.includes('label') &&
          !key.toLowerCase().includes('createdAt'.toLowerCase())
        )
          vertex[key] = value
      })
      if (uuid) vertex.uuid = uuid
      vertex.updatedAt = new Date()
      request(res, await this.#vertex.update(id, vertex))
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  delete = async (res: Response, id: string | string[] | undefined) => {
    if (Number(id)) {
      if (await this.#vertex.check(Number(id))) {
        request(res, await this.#vertex.delete(Number(id)))
      } else res.status(400).json({ error: "Vertex doesn't exist." })
    }
  }
}

export default new VertexController()
