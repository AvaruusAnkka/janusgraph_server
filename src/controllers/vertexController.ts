import GremlinQueries from '../gremlin'
import request from '../index'
import { Response } from 'express'

class VertexController {
  #vertex = GremlinQueries.vertex
  #ignore = new RegExp(/^(id|createdAt|updatedAt)$/, 'i')

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

  add = async (res: Response, body: object) => {
    if (body) {
      const now = new Date().getTime()
      const vertex: { [key: string]: string | number } = {
        label: 'vertex',
        createdAt: now,
        updatedAt: now,
      }
      for (const [key, value] of Object.entries(body)) {
        if (!this.#ignore.test(key)) vertex[key] = value
      }
      request(res, await this.#vertex.add(vertex))
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  update = async (res: Response, body: { [key: string]: string }) => {
    if (body.id) {
      const vertex: { [key: string]: string | number } = {
        id: body.id,
        updateAt: new Date().getTime(),
      }
      for (const [key, value] of Object.entries(body)) {
        if (!this.#ignore.test(key)) vertex[key] = value
      }
      request(res, await this.#vertex.update(vertex))
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  delete = async (res: Response, id: string | string[] | undefined) => {
    if (Number(id)) {
      if (await this.#vertex.check(Number(id))) {
        request(res, await this.#vertex.delete(Number(id)))
      } else res.status(400).json({ error: "Vertex doesn't exist." })
    }
  }

  drop = async () => await this.#vertex.drop()

  clean = async () => await this.#vertex.clean()
}

export default new VertexController()
