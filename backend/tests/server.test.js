import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildServer } from '../server.js'

describe('GET /', () => {
  it('returns hello world as JSON', async () => {
    const fastify = buildServer()
    try {
      const response = await fastify.inject({ method: 'GET', url: '/' })
      assert.equal(response.statusCode, 200)
      assert.deepEqual(response.json(), { hello: 'world' })
      assert.match(response.headers['content-type'], /application\/json/)
    } finally {
      await fastify.close()
    }
  })

  it('returns 404 for unknown routes', async () => {
    const fastify = buildServer()
    try {
      const response = await fastify.inject({ method: 'GET', url: '/nope' })
      assert.equal(response.statusCode, 404)
    } finally {
      await fastify.close()
    }
  })
})
