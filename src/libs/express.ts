const express = require('express')
const app = express()
const port = 3000

const request = async (res: any, query: Function) => {
  try {
    const result = await query() // Example Gremlin query
    res.json(result)
  } catch (error) {
    console.error('Error executing Gremlin query:', error)
    res.status(500).json({ error: 'Something went wrong.' })
  }
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

export default app
export { request }
