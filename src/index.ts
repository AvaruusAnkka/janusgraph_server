import express, { Express, Request, Response } from 'express'
import VertexController from './controllers/vertexController'

const app: Express = express()
const port = 3000

// const request = async (res: Response, query: Function) => {
//   try {
//     const result = await query()
//     res.json(result)
//   } catch (error) {
//     console.error('Error executing Gremlin query:', error)
//     res.status(500).json({ error: 'Something went wrong.' })
//   }
// }

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
    VertexController.getEdge(res, req.headers.id)
  })
  .post(async (req: Request, res: Response) => {
    VertexController.addEdge(res, req.headers.from, req.headers.to)
  })

// app
//   .route('/edge')
//   .get(async (req: Request, res: Response) => {
//     if (req.headers.id && Number(req.headers.id)) {
//       const vertex = await VertexController.getEdge(Number(req.headers.id))
//       if (vertex)
//         request(res, () => VertexController.getEdge(Number(req.headers.id)))
//       else res.status(400).json({ error: 'Invalid id.' })
//     } else {
//       const response: any = await VertexController.getEdge()
//       try {
//         const asObject = response.map((val: any) => Object.fromEntries(val))
//         request(res, () => asObject)
//       } catch (error) {
//         request(res, () => response)
//       }
//     }
//   })
//   .post(async (req: Request, res: Response) => {})
//   .delete(async (req: Request, res: Response) => {
//     if (req.headers.id && Number(req.headers.id)) {
//       request(res, () => VertexController.deleteEdge(Number(req.headers.id)))
//     } else request(res, () => VertexController.deleteEdge())
//   })

app.post('/faker', (req: Request, res: Response) => {
  VertexController.createFake(res, req.headers.id)
})

// app.delete('/withoutEdge', (req: Request, res: Response) => {
//   VertexController.deleteWithoutEdge(res)
// })

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
