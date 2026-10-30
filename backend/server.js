import Fastify from 'fastify'
import { fileURLToPath } from 'node:url'

export function buildServer(options = {}) {
  const fastify = Fastify({
    logger: false,
    ...options,
  })

  fastify.get('/', async () => {
    return { hello: 'world' }
  })

  return fastify
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url)

if (isMain) {
  const fastify = buildServer({ logger: true })
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
