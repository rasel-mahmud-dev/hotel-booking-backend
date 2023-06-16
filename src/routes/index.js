import { Router } from "express"


const router = Router()


router.get("/", function (req, res){
    res.status(200).send("Hello")
})

router.get("/health", function (req, res){
    res.status(200).json({message: "Success"})
})



export default router