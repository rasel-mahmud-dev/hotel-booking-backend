import app from "./app/app"


const PORT = process.env.PORT || 1000

app.listen(PORT, () => {
    console.info("server is running on port: " + PORT)
})