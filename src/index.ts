import EdgeController from './controllers/edgeController'
import VertexController from './controllers/vertexController'
import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import 'dotenv/config'

const app: Express = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}, ${req.method}, ${req.url}`)
  next()
})

const vertex = VertexController
const edge = EdgeController

app
  .route('/vertex')
  .get((req: Request, res: Response) => {
    try {
      vertex.getOne(res, req.body.id)
    }
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
