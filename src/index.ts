import EdgeController from './controllers/edgeController'
import VertexController from './controllers/vertexController'
import express, { Express, Request, Response } from 'express'

const app: Express = express()
const port = 3000

const request = async (res: Response, result: object[] | object) => {
  try {
    if (Array.isArray(result)) {
      const asObject = result.map((val: any) => Object.fromEntries(val))
      if (asObject.length === 1) res.json(asObject[0])
      else res.json(asObject)
    } else res.json(result)
  } catch (error) {
    console.error('Error executing Gremlin query:', error)
    res.status(500).json({ error: 'Something went wrong.' })
  }
}

export default request
app
  .route('/vertex')
  .get(async (req: Request, res: Response) => {
    VertexController.getGraphData(res)
  })
  .post((req: Request, res: Response) => {
    // VertexController.addVertex(res, req.headers)
  })
  .put(async (req: Request, res: Response) => {
    VertexController.updateVertex(res, req.headers)
  })
  .delete(async (req: Request, res: Response) => {
    VertexController.deleteVertex(res, req.headers.id)
  })

app
  .route('/edge')
  .get(async (req: Request, res: Response) => {
    EdgeController.getEdge(res, req.headers.id)
  })
  .post(async (req: Request, res: Response) => {
    EdgeController.addEdge(res, req.headers.from, req.headers.to)
  })

app.post('/faker', (req: Request, res: Response) => {
  VertexController.createFake(res, req.headers.id)
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
