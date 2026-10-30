import { buildServer } from './app.js'

const fastify = buildServer({ logger: true })
try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
