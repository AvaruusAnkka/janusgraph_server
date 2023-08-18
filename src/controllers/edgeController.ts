import GremlinQueries from '../gremlin'
import request from '../index'
import { Response } from 'express'

class EdgeController {
  #edge = GremlinQueries.edge

  getOne = async (res: Response, vertexId: string | string[] | undefined) => {
    if (vertexId) {
      if (await this.#edge.check(String(vertexId))) {
        const response: any = await this.#edge.get(String(vertexId))
        request(res, response.value)
      } else res.status(404).json({ error: 'Edge not found.' })
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  add = async (
    res: Response,
    from: string | string[] | undefined,
    to: string | string[] | undefined
  ) => {
    if (Number(from) && Number(to)) {
      if (
        (await GremlinQueries.vertex.check(Number(from))) &&
        (await GremlinQueries.vertex.check(Number(to)))
      ) {
        const response: any = await this.#edge.add(Number(from), Number(to))
        request(res, response._items[0])
      } else res.status(404).json({ error: 'Vertex not found.' })
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  delete = async (res: Response, vertexId: string | string[] | undefined) => {
    if (vertexId) {
      if (await this.#edge.check(String(vertexId))) {
        request(res, this.#edge.delete(String(vertexId)))
      } else res.status(404).json({ error: 'Edge not found.' })
    } else res.status(400).json({ error: 'Invalid data.' })
  }
}

export default new EdgeController()
