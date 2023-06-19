import express, { Express, Response } from 'express'
import Person from './models/personModel'
import { fakePerson } from './libs/faker'
import VertexController from './controllers/vertexController'
import GremlinQueries from './libs/gremlin'
import { parse } from 'path'

const app: Express = express()
const port = 3000

const request = async (res: Response, query: Function) => {
  try {
    const result = await query()
    res.json(result)
  } catch (error) {
    console.error('Error executing Gremlin query:', error)
    res.status(500).json({ error: 'Something went wrong.' })
  }
}

app
  .route('/vertex')
  .get(async (req: any, res: any) => {
    if (req.headers.id && parseInt(req.headers.id)) {
      if (await VertexController.check(parseInt(req.headers.id)))
        request(res, () => VertexController.getVertex(parseInt(req.headers.id)))
      else res.status(400).json({ error: "Vertex doesn't exist." })
    } else request(res, () => VertexController.getVertex())
  })
  .post((req: any, res: any) => {
    // const newVertex = new Person({
    //   name: req.headers.name,
    //   group: req.headers.group,
    //   info: req.headers.info,
    // })
    // request(res, () => VertexController.add(newVertex))
    request(res, () => VertexController.addVertex(new Person(fakePerson())))
  })
  .put(async (req: any, res: any) => {
    if (req.headers.id && parseInt(req.headers.id)) {
      if (await VertexController.check(parseInt(req.headers.id))) {
        const person = new Person(
          await VertexController.getVertex(parseInt(req.headers.id))
        )
        if (req.headers.name) person.name = req.headers.name
        if (req.headers.group) person.group = req.headers.group
        if (req.headers.info) person.info = req.headers.info
        request(res, () =>
          VertexController.updateVertex(parseInt(req.headers.id), person)
        )
      } else res.status(400).json({ error: "Vertex doesn't exist." })
    } else res.status(400).json({ error: 'Invalid id.' })
  })
  .delete(async (req: any, res: any) => {
    if (req.headers.id && parseInt(req.headers.id)) {
      request(res, () =>
        VertexController.deleteVertex(parseInt(req.headers.id))
      )
    } else request(res, () => VertexController.deleteVertex())
  })

app
  .route('/edge')
  .get(async (req: any, res: any) => {
    if (req.headers.id && parseInt(req.headers.id)) {
      const vertex = await VertexController.getEdge(parseInt(req.headers.id))
      if (vertex)
        request(res, () => VertexController.getEdge(parseInt(req.headers.id)))
      else res.status(400).json({ error: 'Invalid id.' })
    } else request(res, () => VertexController.getEdge())
  })
  .post(async (req: any, res: any) => {
    if (
      req.headers.from &&
      parseInt(req.headers.from) &&
      req.headers.to &&
      parseInt(req.headers.to)
    ) {
      const from = await VertexController.getEdge(parseInt(req.headers.v1))
      const to = await VertexController.getEdge(parseInt(req.headers.v2))
      if (from && to)
        res.status(400).json({ error: "Vertex(s) doesn't exists." })
      else
        request(res, () =>
          VertexController.addEdge(
            parseInt(req.headers.from),
            parseInt(req.headers.to)
          )
        )
    } else res.status(400).json({ error: 'Invalid id.' })
  })
  .delete(async (req: any, res: any) => {
    if (req.headers.id && parseInt(req.headers.id)) {
      request(res, () => VertexController.deleteEdge(parseInt(req.headers.id)))
    } else request(res, () => VertexController.deleteEdge())
  })

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
