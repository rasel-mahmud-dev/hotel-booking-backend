
import requiredAuth from "src/middewares/requiredAuth";
import requiredRoles from "src/middewares/requiredRoles";
import {createRoom} from "src/controllers/roomContoller";

const router = require("express").Router();

// only admin and hotel owner can add room
router.post("/create", requiredAuth, requiredRoles(["ADMIN", "HOTEL_OWNER"]), createRoom);



export default router