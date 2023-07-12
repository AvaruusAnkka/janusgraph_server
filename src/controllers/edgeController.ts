import GremlinQueries from '../libs/gremlin'
import request from '../index'
import { Response } from 'express'

class EdgeController {
  getEdge = async (res: Response, vertexId?: string | string[] | undefined) => {
    if (Number(vertexId))
      request(res, await GremlinQueries.getEdgeById(Number(vertexId)))
    else request(res, await GremlinQueries.getEdges())
  }

  addEdge = (
    res: Response,
    from?: string | string[] | undefined,
    to?: string | string[] | undefined
  ) => {
    if (Number(from) && Number(to))
      request(res, GremlinQueries.addEdge(Number(from), Number(to)))
    else res.status(400).json({ error: 'Invalid data.' })
  }

  deleteEdge = (res: Response, vertexId?: string | string[] | undefined) => {
    if (Number(vertexId))
      request(res, GremlinQueries.deleteEdgeById(Number(vertexId)))
    else res.status(400).json({ error: 'Invalid data.' })
  }
}

export default new EdgeController()
