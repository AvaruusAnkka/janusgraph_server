import EdgeController from './controllers/edgeController'
import VertexController from './controllers/vertexController'
import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import 'dotenv/config'

const app: Express = express()
const port = process.env.PORT

app.use(cors())
app.use(express.urlencoded({ extended: true }))

const request = (res: Response, result: object[] | object) => {
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
  .get((req: Request, res: Response) => {
    vertex.getOne(res, req.body.id)
  })
  .post((req: Request, res: Response) => {
    console.log(req.body)
    vertex.add(res, req.body)
  })
  .put((req: Request, res: Response) => {
    vertex.update(res, req.body)
  })
  .delete((req: Request, res: Response) => {
    vertex.delete(res, req.body.id)
  })

app.get('/vertices', async (req: Request, res: Response) => {
  try {
    res.json(await vertex.getAll())
  } catch (error) {
    console.error('Error executing Gremlin query:', error)
    res.status(500).json({ error: 'Something went wrong.' })
  }
})

app
  .route('/edge')
  .get((req: Request, res: Response) => {
    edge.getOne(res, req.body.id)
  })
  .post(async (req: Request, res: Response) => {
    edge.add(res, req.body.from, req.body.to)
  })
  .delete((req: Request, res: Response) => {
    edge.delete(res, req.body.id)
  })

app.get('/graph', (req: Request, res: Response) => {
  Promise.all([vertex.getAll(), edge.getLinks()])
    .then((values) => res.json({ nodes: values[0], links: values[1] }))
    .catch((error) => {
      console.error('Error executing Gremlin query:', error)
      res.status(500).json({ error: 'Something went wrong.' })
    })
})

app.delete('/clean', async (req: Request, res: Response) => {
  request(res, await vertex.clean())
})

app.delete('/drop', async (req: Request, res: Response) => {
  request(res, await vertex.drop())
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

export default request
