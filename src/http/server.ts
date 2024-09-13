import fastifyCors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import fastify from 'fastify'
import {
    type ZodTypeProvider,
    serializerCompiler,
    validatorCompiler,
} from 'fastify-type-provider-zod'
import fs from 'node:fs'
import path from 'node:path'
import { createCompletionRoute } from './routes/create-completion'
import { createGoalRoute } from './routes/create-gol'
import { deleteCompletionRoute } from './routes/delete-completion'
import { getPendingGoalsRoute } from './routes/get-pending-gouls'
import { getWeekSummaryRoute } from './routes/get-week-summary'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
    origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

const swaggerJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../docs/swagger.json'), 'utf-8')
)

app.register(fastifyStatic, {
    root: path.join(__dirname, '../docs'),
    prefix: '/docs',
})

app.register(require('@fastify/swagger'), {
    mode: 'static',
    specification: {
        document: swaggerJson,
    },
})

app.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: header => header,
})

app.register(createGoalRoute)
app.register(createCompletionRoute)
app.register(getPendingGoalsRoute)
app.register(getWeekSummaryRoute)
app.register(deleteCompletionRoute)

app.listen({
    port: 3333,
    host: '0.0.0.0',
}).then(() => {
    console.log('HTTP server running!')
})
