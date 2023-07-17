import EdgeController from './controllers/edgeController'
import VertexController from './controllers/vertexController'
import express, { Express, Request, Response } from 'express'
import faker from './libs/faker'

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

const vertex = VertexController
const edge = EdgeController

app
  .route('/vertex')
  .get(async (req: Request, res: Response) => {
    vertex.get(res, req.headers.id)
  })
  .post((req: Request, res: Response) => {
    vertex.add(res, JSON.stringify(req.headers))
  })
  .put(async (req: Request, res: Response) => {
    vertex.update(res, JSON.stringify(req.headers))
  })
  .delete(async (req: Request, res: Response) => {
    vertex.delete(res, req.headers.id)
  })

app
  .route('/edge')
  .get(async (req: Request, res: Response) => {
    edge.get(res, req.headers.id)
  })
  .post(async (req: Request, res: Response) => {
    edge.add(res, req.headers.from, req.headers.to)
  })

app.get('/graph', (req: Request, res: Response) => {
  Promise.all([vertex.getNodes(), edge.getLinks()]).then((values) =>
    request(res, { nodes: values[0], links: values[1] })
  )
})

app.post('/faker', (req: Request, res: Response) => {
  vertex.add(res, JSON.stringify(faker()))
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

export default request
