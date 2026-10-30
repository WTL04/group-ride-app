import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify'

export function buildServer(options: FastifyServerOptions = {}): FastifyInstance {
  const app: FastifyInstance = Fastify({
    logger: false,
    ...options,
  })

  app.get('/', async () => {
    return { hello: 'world' }
  })

  return app
}
