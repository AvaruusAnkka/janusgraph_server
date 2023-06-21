import GremlinQueries from '../libs/gremlin'
import Vertex from '../models/vertexModel'
import { Response } from 'express'

const requestNew = (res: Response, result: object) => {
  try {
    console.log('requestNew', result)
    res.json(result)
  } catch (error) {
    console.error('Error executing Gremlin query:', error)
    res.status(500).json({ error: 'Something went wrong.' })
  }
}

export default class VertexController {
  static check = (vertexId: number) => GremlinQueries.checkVertex(vertexId)

  private static isMapObject = (mapObject: any) => {
    if (mapObject.value instanceof Map)
      return mapObject.value.map((val: any) => Object.fromEntries(val))
    return mapObject
  }

  static getVertex = async (res: Response, vertexId: any) => {
    if (vertexId) {
      if (Number(vertexId)) {
        const result: object = this.isMapObject(
          await GremlinQueries.getVertex(vertexId)
        )
        requestNew(res, result)
      } else res.status(400).json({ error: 'Invalid id.' })
    } else {
      const result: object = await this.isMapObject(GremlinQueries.getVertices)
      console.log('getVertex', result)
      requestNew(res, result)
    }
  }

  private static checkParameters = (headers: any) => {
    if (!headers.label) return { error: 'Invalid label.' }
    if (!headers.name) return { error: 'Invalid name.' }
    if (!headers.owner) return { error: 'Invalid owner.' }
    if (!headers.group) return { error: 'Invalid group.' }
    if (!headers.info) return { error: 'Invalid info.' }
    return true
  }

  static addVertex = async (res: Response, headers: any) => {
    const check = this.checkParameters(headers)
    if (check !== true) return check

    requestNew(res, () =>
      GremlinQueries.addVertex(
        new Vertex({
          label: headers.label,
          name: headers.name,
          owner: headers.owner,
          group: headers.group,
          info: headers.info,
          createdAt: new Date(),
          modifiedAt: new Date(),
        })
      )
    )
  }

  static updateVertex = (headers: any) => {
    return { test: 'test' }
  }

  static deleteVertex = (vertexId: number): any =>
    GremlinQueries.deleteVertex(vertexId)

  static deleteAllVertices = () => GremlinQueries.deleteVertices()

  static getEdge = (vertexId?: number) => {
    if (vertexId) {
      return GremlinQueries.getEdge(vertexId)
    } else return GremlinQueries.getEdges()
  }

  static addEdge = (from: any, to: any) => {
    if (Number(from) && Number(to)) {
      // return Promise.all([
      //   this.getVertex(Number(from)),
      //   this.getVertex(Number(to)),
      // ]).then((vertices) => {
      //   if (vertices[0].error && vertices[1].error)
      //     return { error: 'Invalid vertex(s).' }
      //   return  GremlinQueries.addEdge(Number(from), Number(to))
      // })
    }
    return { test: 'test' }
  }

  static deleteEdge = (vertexId: number) => GremlinQueries.deleteEdge(vertexId)

  static deleteEdges = () => GremlinQueries.deleteEdges()
}
