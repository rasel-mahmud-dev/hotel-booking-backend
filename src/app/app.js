import express from "express"

import cors from "cors"

require("dotenv").config({
    path: '.env'
})

import routes from "../routes"


const app = express()

app.use(express.json())


const allowedOrigin = [process.env.FRONTEND]

// CORS options
const corsOptions = {
    origin: allowedOrigin,
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// CORS middleware
app.use(cors(corsOptions));


// all route are initiated
app.use(routes)



// global error handler middleware
app.use((err, req, res, next) => {
    let message = "Internal error"
    if (typeof err === "string") {
        message = err
    } else if (err?.message && typeof err?.message === "string") {
        message = err?.message
    }
    if (err) {
        res.status(500).json({ message })
    }
})


export default app