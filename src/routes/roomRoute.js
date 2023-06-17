
import requiredAuth from "src/middewares/requiredAuth";
import requiredRoles from "src/middewares/requiredRoles";
import {createRoom, filterRooms} from "src/controllers/roomContoller";

const router = require("express").Router();

// only admin and hotel owner can add room
router.post("/create", requiredAuth, requiredRoles(["ADMIN", "HOTEL_OWNER"]), createRoom);
router.post("/filter", requiredAuth, filterRooms);



export default router