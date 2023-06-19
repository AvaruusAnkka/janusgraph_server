import GremlinQueries from '../libs/gremlin'

export default class VertexController {
  static check = (userId: number) => GremlinQueries.check(userId)

  static getVertex = (userId?: number) => {
    if (userId) {
      return GremlinQueries.getById(userId)
    } else return GremlinQueries.getAll()
  }

  static addVertex = (vertex: any) => GremlinQueries.add(vertex)

  static updateVertex = (userId: number, vertex: any) =>
    GremlinQueries.update(userId, vertex)

  static deleteVertex = (userId?: number): any => {
    if (userId) return GremlinQueries.deleteById(userId)
    else return GremlinQueries.deleteAll()
  }

  static getEdge = (userId?: number) => {
    if (userId) {
      return GremlinQueries.getEdges(userId)
    } else return GremlinQueries.getEdges()
  }

  static addEdge = (from: number, to: number) =>
    GremlinQueries.addEdge(from, to)

  static deleteEdge = (userId?: number) => {
    if (userId) return GremlinQueries.deleteEdge(userId)
    else return GremlinQueries.deleteAllEdges()
  }
}
