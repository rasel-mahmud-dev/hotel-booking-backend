import {authLoad, createNewUser, login, updateProfile} from "src/controllers/authController";
import requiredAuth from "src/middewares/requiredAuth";


const router = require("express").Router();

router.post("/registration", createNewUser);
router.post("/login", login);
router.get("/fetch-auth", authLoad);
router.post("/update", requiredAuth, updateProfile);


export default router