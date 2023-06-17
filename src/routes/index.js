import { Router } from "express"
import authRoute from "./authRoute";
import hotelRoute from "src/routes/hotelRoute";
import roomRoute from "src/routes/roomRoute";



const router = Router()


router.get("/", function (req, res){
    res.status(200).send("Hello")
})

router.get("/health", function (req, res){
    res.status(200).json({message: "Success"})
})


router.use("/api/auth", authRoute)
router.use("/api/hotel", hotelRoute)
router.use("/api/room", roomRoute)



export default router