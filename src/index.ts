import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import 'dotenv/config'
import gremlin from './gremlin'

const app: Express = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.urlencoded({ extended: true }))

let globalRes: Response

const validateBody = (body: { [key: string]: string }) => {
  const final: { [key: string]: string } = {}
  for (const key in body) {
    if (body[key] !== undefined && body[key] !== null && body[key] !== '') {
      final[key.toLowerCase()] = body[key].replace(/'/g, "\\'").toLowerCase()
    }
  }
  return final
}

const safeQuery = async (query: Function) => {
  try {
    const response = await query()
    globalRes.json(response)
  } catch (error) {
    console.error('Error executing Gremlin query:', error)
    globalRes.status(500).json({ error: 'Something went wrong.' })
  }
}

const validateData = (data: { [key: string]: string }) => {
  if (Object.keys(data).length === 0) {
    globalRes.status(400).json({ error: 'No data provided.' })
    return false
  }
  return true
}

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}, ${req.method}, ${req.url}`)
  globalRes = res
  req.body = validateBody(req.body)
  next()
})

app
  .route('/vertex')
  .get(async (req: Request, res: Response) => {
    safeQuery(() => gremlin.vertex.get(req.body))
  })
  .post(async (req: Request, res: Response) => {
    if (!validateData(req.body)) return
    safeQuery(() => gremlin.vertex.add(req.body))
  })
  .put(async (req: Request, res: Response) => {
    if (!validateData(req.body)) return
    else if (req.body.id === undefined)
      res.status(400).json({ error: 'No id provided.' })
    else {
      const vertices = await gremlin.vertex.get({ id: req.body.id })
      if (Object.keys(vertices).length === 0)
        res.status(404).json({ error: 'Vertex not found.' })
      else safeQuery(() => gremlin.vertex.update(req.body))
    }
  })
  .delete(async (req: Request, res: Response) => {
    if (!validateData(req.body)) return
    else if (!req.body.id) res.status(400).json({ error: 'No id provided.' })
    else if (!Number(req.body.id))
      res.status(400).json({ error: 'Invalid id provided.' })
    else safeQuery(() => gremlin.vertex.delete(req.body.id))
  })

app
  .route('/edge')
  .get(async (req: Request, res: Response) => {
    safeQuery(() => gremlin.edge.get(req.body))
  })
  .post((req: Request, res: Response) => {
    if (!validateData(req.body)) return
    else if (!Number(req.body.from) || !Number(req.body.to))
      res.status(400).json({ error: 'Invalid id provided.' })
    else {
      console.log('Body:', req.body)
      safeQuery(() =>
        Promise.all([
          gremlin.vertex.get({ id: req.body.from }),
          gremlin.vertex.get({ id: req.body.to }),
        ]).then(async (values) => {
          if (!values[0].length || !values[1].length)
            return { error: 'Vertex(s) not found.' }
          else await gremlin.edge.add(req.body)
        })
      )
    }
  })
  .delete(async (req: Request, res: Response) => {
    if (!validateData(req.body)) return
    safeQuery(() => gremlin.edge.delete(req.body.id))
  })

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
