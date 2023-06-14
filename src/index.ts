import app, { request } from './libs/express'
import Gremlin from './libs/gremlin'
import { fakePerson } from './libs/faker'
import Person from './person'

app
  .route('/')
  .get((req: any, res: any) => {
    if (req.headers.id && parseInt(req.headers.id)) {
      request(res, () => Gremlin.get(parseInt(req.headers.id)))
    } else request(res, () => Gremlin.get())
  })
  .post((req: any, res: any) => {
    request(res, () => Gremlin.add(fakePerson()))
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
        if (req.headers.information)
          person.information = req.headers.information
        request(res, () => Gremlin.update(parseInt(req.headers.id), person))
      }
    } else res.status(400).json({ error: 'Invalid id.' })
  })
  .delete(async (req: any, res: any) => {
    if (req.headers.id && parseInt(req.headers.id)) {
      request(res, () => Gremlin.delete(parseInt(req.headers.id)))
    } else request(res, () => Gremlin.delete())
  })
