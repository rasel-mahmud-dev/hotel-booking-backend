import app from "./app/app"

import indexesCollections from "src/models/indexesCollections";

const PORT = process.env.PORT || 2000

app.listen(PORT, () => {
    // indexesCollections()
    console.info("server is running on port: " + PORT)
})
