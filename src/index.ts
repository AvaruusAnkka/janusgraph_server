import app, { request } from './libs/express'
import Gremlin from './libs/gremlin'
import { fakePerson } from './libs/faker'
import Person from './classes/person'

app
  .route('/vertex')
  .get((req: any, res: any) => {
    if (req.headers.id && parseInt(req.headers.id)) {
      request(res, () => Gremlin.get(parseInt(req.headers.id)))
    } else request(res, () => Gremlin.get())
  })
  .post((req: any, res: any) => {
    request(res, () => Gremlin.add(new Person(fakePerson())))
  })
  .put(async (req: any, res: any) => {
    if (req.headers.id && parseInt(req.headers.id)) {
      const object = await Gremlin.get(parseInt(req.headers.id))
      if (object.length === 0)
        return res.status(400).json({ error: 'Invalid id.' })
      else {
        const person = new Person(object[0])
        if (req.headers.name) person.name = req.headers.name
        if (req.headers.group) person.group = req.headers.group
        if (req.headers.info) person.info = req.headers.info
        request(res, () => Gremlin.update(parseInt(req.headers.id), person))
      }
    } else res.status(400).json({ error: 'Invalid id.' })
  })
  .delete(async (req: any, res: any) => {
    if (req.headers.id && parseInt(req.headers.id)) {
      request(res, () => Gremlin.delete(parseInt(req.headers.id)))
    } else request(res, () => Gremlin.delete())
  })

app
  .route('/edge')
  .get(async (req: any, res: any) => {
    if (req.headers.id && parseInt(req.headers.id)) {
      const vertex = await Gremlin.get(parseInt(req.headers.id))
      if (vertex.length !== 0)
        request(res, () => Gremlin.getE(parseInt(req.headers.id)))
      else res.status(400).json({ error: 'Invalid id.' })
    } else request(res, () => Gremlin.getE())
  })
  .post(async (req: any, res: any) => {
    if (
      req.headers.from &&
      parseInt(req.headers.from) &&
      req.headers.to &&
      parseInt(req.headers.to)
    ) {
      const from = await Gremlin.get(parseInt(req.headers.v1))
      const to = await Gremlin.get(parseInt(req.headers.v2))
      if (from.length === 0 || to.length === 0)
        res.status(400).json({ error: "Vertex(s) doesn't exists." })
      else
        request(res, () =>
          Gremlin.addE(parseInt(req.headers.from), parseInt(req.headers.to))
        )
    } else res.status(400).json({ error: 'Invalid id.' })
  })

app.get('/', (req: any, res: any) => {
  console.log('GET /')
  return request(res, () => Gremlin.getAll())
})
