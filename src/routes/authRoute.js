import {login,} from "../controllers/authController";


const router = require("express").Router();

router.post("/login", login);


export default router