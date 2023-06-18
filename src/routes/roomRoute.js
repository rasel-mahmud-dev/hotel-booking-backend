import requiredAuth from "src/middewares/requiredAuth";
import requiredRoles from "src/middewares/requiredRoles";
import {
    getRooms,
    checkInReserve,
    checkOutReserve,
    createRoom,
    filterRooms,
    reserveRoom,
    getRoom
} from "src/controllers/roomContoller";

const router = require("express").Router();


router.get("/", requiredAuth, getRooms);

router.get("/detail", requiredAuth, getRoom);

// only admin and hotel owner can add room
router.post("/create", requiredAuth, requiredRoles(["ADMIN", "HOTEL_OWNER"]), createRoom);
router.post("/filter",  requiredAuth, filterRooms);


// confirm reserve/book room  
router.post("/reserve", requiredAuth, reserveRoom);

// user can check their booked room by their email, room number or reserve id
router.post("/checkIn", requiredAuth, checkInReserve);


// when guest leave their room. 
// then it's mandatory to check out unless pay for next day
router.post("/checkOut", requiredAuth, checkOutReserve);


export default router