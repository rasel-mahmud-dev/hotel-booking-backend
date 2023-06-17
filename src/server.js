import app from "./app/app"

import Base from "src/models/Base"

const PORT = process.env.PORT || 2000

app.listen(PORT, () => {
    Base.initialMongodbIndexes([]).then(()=>{
        console.log("indexing")
    }).catch(ex=>{
        console.log(ex)
    })
    console.info("server is running on port: " + PORT)
})
