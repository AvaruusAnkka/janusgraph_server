import express, { Express, Request, Response } from 'express'
import Person from './models/personModel'
import VertexController from './controllers/vertexController'
import { fakePerson } from './libs/faker'

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
  .get(async (req: Request, res: Response) => {
    if (req.headers.id && Number(req.headers.id)) {
      if (await VertexController.check(Number(req.headers.id)))
        request(res, () => VertexController.getVertex(Number(req.headers.id)))
      else res.status(400).json({ error: "Vertex doesn't exist." })
    } else {
      const response: any = await VertexController.getVertex()
      try {
        const mapObject = response.map((values: any) =>
          Object.fromEntries(values)
        )
        request(res, () => mapObject)
      } catch (error) {
        request(res, () => response)
      }
    }
  })
  .post((req: Request, res: Response) => {
    const newVertex = new Person({
      name: req.headers.name,
      group: req.headers.group,
      info: req.headers.info,
      createdAt: new Date(),
      modifiedAt: new Date(),
    })
    request(res, () => VertexController.addVertex(newVertex))
  })
  .put(async (req: Request, res: Response) => {
    if (req.headers.id && Number(req.headers.id)) {
      if (await VertexController.check(Number(req.headers.id))) {
        const person = new Person(
          await VertexController.getVertex(Number(req.headers.id))
        )
        if (req.headers.name) person.name = String(req.headers.name)
        if (req.headers.group) person.group = String(req.headers.group)
        if (req.headers.info) person.info = String(req.headers.info)
        request(res, () =>
          VertexController.updateVertex(Number(req.headers.id), person)
        )
      } else res.status(400).json({ error: "Vertex doesn't exist." })
    } else res.status(400).json({ error: 'Invalid id.' })
  })
  .delete(async (req: Request, res: Response) => {
    if (req.headers.id && Number(req.headers.id)) {
      request(res, () => VertexController.deleteVertex(Number(req.headers.id)))
    } else request(res, () => VertexController.deleteVertex())
  })

app
  .route('/edge')
  .get(async (req: Request, res: Response) => {
    if (req.headers.id && Number(req.headers.id)) {
      const vertex = await VertexController.getEdge(Number(req.headers.id))
      if (vertex)
        request(res, () => VertexController.getEdge(Number(req.headers.id)))
      else res.status(400).json({ error: 'Invalid id.' })
    } else {
      const response: any = await VertexController.getEdge()
      try {
        const asObject = response.map((val: any) => Object.fromEntries(val))
        request(res, () => asObject)
      } catch (error) {
        request(res, () => response)
      }
    }
  })
  .post(async (req: Request, res: Response) => {
    if (
      req.headers.from &&
      Number(req.headers.from) &&
      req.headers.to &&
      Number(req.headers.to)
    ) {
      Promise.all([
        VertexController.check(Number(req.headers.from)),
        VertexController.check(Number(req.headers.to)),
      ]).then((vertices) => {
        if (vertices[0] && vertices[1])
          request(res, () =>
            VertexController.addEdge(
              Number(req.headers.from),
              Number(req.headers.to)
            )
          )
        else res.status(400).json({ error: "Vertex(s) doesn't exists." })
      })
    } else res.status(400).json({ error: 'Invalid id.' })
  })
  .delete(async (req: Request, res: Response) => {
    if (req.headers.id && Number(req.headers.id)) {
      request(res, () => VertexController.deleteEdge(Number(req.headers.id)))
    } else request(res, () => VertexController.deleteEdge())
  })

app.post('/faker', (req: Request, res: Response) => {
  request(res, () => VertexController.addVertex(new Person(fakePerson())))
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
