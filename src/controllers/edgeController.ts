import GremlinQueries from '../libs/gremlin'
import request from '../index'
import { Response } from 'express'

class EdgeController {
  #edge = GremlinQueries.edge

  get = async (res: Response, vertexId?: string | string[] | undefined) => {
    if (Number(vertexId)) request(res, await this.#edge.get(Number(vertexId)))
    else res.status(400).json({ error: 'Invalid data.' })
  }

  getLinks = async () => {
    const links: any = await this.#edge.getLinks()
    return links._items.map((val: any) => Object.fromEntries(val))
  }

  add = async (
    res: Response,
    from: string | string[] | undefined,
    to: string | string[] | undefined
  ) => {
    if (Number(from) && Number(to)) {
      const query = this.#edge.add(Number(from), Number(to))
      return query
    } else res.status(400).json({ error: 'Invalid data.' })
  }

  delete = (res: Response, vertexId?: string | string[] | undefined) => {
    if (Number(vertexId)) request(res, this.#edge.delete(Number(vertexId)))
    else res.status(400).json({ error: 'Invalid data.' })
  }
}

export default new EdgeController()
