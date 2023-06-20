import GremlinQueries from '../libs/gremlin'

export default class VertexController {
  static check = (vertexId: number) => GremlinQueries.checkVertexById(vertexId)

  static getVertex = (vertexId?: number) => {
    if (vertexId) {
      return GremlinQueries.getVertexById(vertexId)
    } else return GremlinQueries.getAllVertices()
  }

  static addVertex = (vertex: any) => GremlinQueries.addVertex(vertex)

  static updateVertex = (vertexId: number, vertex: any) =>
    GremlinQueries.updateVertex(vertexId, vertex)

  static deleteVertex = (vertexId?: number): any => {
    if (vertexId) return GremlinQueries.deleteVertexById(vertexId)
    else return GremlinQueries.deleteAllVertices()
  }

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
