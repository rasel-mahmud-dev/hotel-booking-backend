import {authLoad, createNewUser, login, updateProfile, getUsers } from "src/controllers/authController";
import requiredAuth from "src/middewares/requiredAuth";
import requiredRoles from "src/middewares/requiredRoles";


const router = require("express").Router();

router.post("/registration", createNewUser);
router.post("/login", login);
router.get("/fetch-auth", authLoad);
router.post("/update", requiredAuth, updateProfile);

router.post("/users", requiredAuth, requiredRoles(["ADMIN"]), getUsers);


export default router