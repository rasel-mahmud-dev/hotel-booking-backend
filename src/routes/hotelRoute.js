import {createHotel, getAllHotel, getHotelDetail,} from "src/controllers/hotelContoller";
import requiredAuth from "src/middewares/requiredAuth";
import requiredRoles from "src/middewares/requiredRoles";

const router = require("express").Router();

// only admin and hotel owner can add hotel
router.post("/create", requiredAuth, requiredRoles(["ADMIN", "HOTEL_OWNER"]), createHotel);
router.post("/all", requiredAuth, getAllHotel);

router.get("/detail", requiredAuth, getHotelDetail);


export default router