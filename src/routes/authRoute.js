import {
    createNewUser,
    login,
    authLoad
} from "../controllers/authController";


const router = require("express").Router();

router.post("/registration", createNewUser);
router.post("/login", login);
router.get("/fetch-auth", authLoad);


export default router