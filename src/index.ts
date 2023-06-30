import express, { Express, Request, Response } from 'express'
import VertexController from './controllers/vertexController'
import EdgeController from './controllers/edgeController'

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
    VertexController.getVertex(res, req.headers.id, req.headers.label)
  })
  .post((req: Request, res: Response) => {
    VertexController.addVertex(res, req.headers)
  })
  .put(async (req: Request, res: Response) => {
    VertexController.updateVertex(res, req.headers)
    // if (req.headers.id && Number(req.headers.id)) {
    //   if (await VertexController.check(Number(req.headers.id))) {
    //     const person = new Person(
    //       await VertexController.getVertex(Number(req.headers.id))
    //     )
    //     if (req.headers.name) person.name = String(req.headers.name)
    //     if (req.headers.group) person.group = String(req.headers.group)
    //     if (req.headers.info) person.info = String(req.headers.info)
    //     request(res, () =>
    //       VertexController.updateVertex(Number(req.headers.id), person)
    //     )
    //   } else res.status(400).json({ error: "Vertex doesn't exist." })
    // } else res.status(400).json({ error: 'Invalid id.' })
  })
  .delete(async (req: Request, res: Response) => {
    if (req.headers.id && Number(req.headers.id)) {
      request(res, () => VertexController.deleteVertex(Number(req.headers.id)))
    } else request(res, () => VertexController.deleteVertex())
  })

app.get('/vertex/selection', async (req: Request, res: Response) => {
  VertexController.getSelection(res, req.headers)
})

app
  .route('/edge')
  .get(async (req: Request, res: Response) => {
    if (req.headers.id && Number(req.headers.id)) {
      const vertex = await EdgeController.getEdge(Number(req.headers.id))
      if (vertex)
        request(res, () => EdgeController.getEdge(Number(req.headers.id)))
      else res.status(400).json({ error: 'Invalid id.' })
    } else {
      const response: any = await EdgeController.getEdge()
      try {
        const asObject = response.map((val: any) => Object.fromEntries(val))
        request(res, () => asObject)
      } catch (error) {
        request(res, () => response)
      }
    }
  })
  .post(async (req: Request, res: Response) => {
    // if (Number(req.headers.from) && Number(req.headers.to)) {
    //   Promise.all([
    //     VertexController.getVertex(res, req.headers.from),
    //     VertexController.getVertex(res, req.headers.to),
    //   ]).then((vertices) => {
    //     if (vertices[0] && vertices[1])
    //       request(res, () =>
    //         EdgeController.addEdge(
    //           Number(req.headers.from),
    //           Number(req.headers.to)
    //         )
    //       )
    //     else res.status(400).json({ error: "Vertex(s) doesn't exists." })
    //   })
    // } else res.status(400).json({ error: 'Invalid id.' })
  })
  .delete(async (req: Request, res: Response) => {
    if (req.headers.id && Number(req.headers.id)) {
      request(res, () => EdgeController.deleteEdge(Number(req.headers.id)))
    } else request(res, () => EdgeController.deleteEdge())
  })

app.post('/faker', (req: Request, res: Response) => {
  VertexController.createFake(res, req.headers.id)
})

app.delete('/withoutEdge', (req: Request, res: Response) => {
  VertexController.deleteWithoutEdge(res)
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
