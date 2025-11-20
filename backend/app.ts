import express from 'express'
import cors from 'cors';
import router from './routers'

const app = express()

app.use(cors({
    origin: ['http://localhost:3000', 'https://acolhemais.vombate.com.br'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));
app.use(express.raw({type: 'application/octet-stream', limit: '10mb'}));
app.use(express.json())
app.use(router)

export default app