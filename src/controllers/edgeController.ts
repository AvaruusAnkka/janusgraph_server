import GremlinQueries from '../libs/gremlin'

export default class EdgeController {
  static getEdge = (vertexId?: number) => {
    if (vertexId) {
      return GremlinQueries.getEdgeById(vertexId)
    } else return GremlinQueries.getAllEdges()
  }

  static addEdge = (from: number, to: number) =>
    GremlinQueries.addEdge(from, to)

  static deleteEdge = (vertexId?: number) => {
    if (vertexId) return GremlinQueries.deleteEdge(vertexId)
    else return GremlinQueries.deleteAllEdges()
  }
}
