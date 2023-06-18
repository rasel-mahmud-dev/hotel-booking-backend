import User from "src/models/User";
import {createToken, parseToken} from "src/jwt";
import {compare, makeHash} from "src/hash";
import imageKitUpload from "src/services/ImageKitUpload";
import getToken from "src/utils/getToken";
import {ObjectId} from "mongodb";

import formidable from "formidable";

export const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        let user = await User.findOne({email});

        if (!user) {
            let error = new Error("Your are not registered")
            error.status = 404
            return next(error)
        }

        let match = await compare(password, user.password);
        if (!match) {
            let error = new Error("Password not match")
            error.status = 409
            return next(error)
        }

        let token = await createToken(user._id, user.email, user.role);
        let {password: s, ...other} = user;

        res.status(201).json({token, user: other});
    } catch (ex) {
        next(ex);
    }
};


export const createNewUser = (req, res, next) => {
    // parse a file upload
    const form = formidable({multiples: false});

    form.parse(req, async (err, fields, files) => {
        if (err) return next("Can't read form data");
        try {
            const {
                firstName,
                lastName,
                email,
                role = "USER",
                password,
            } = fields;

            let user = await User.findOne({email});
            if (user) {
                return res.status(404).json({message: "Your are already registered"});
            }

            let avatarUrl = "";

            if (files && files.avatar) {
                let fileName = files.avatar.newFilename + "-" + files.avatar.originalFilename
                let uploadInfo = await imageKitUpload(files.avatar.filepath, fileName, "hotel-booking")
                if (uploadInfo) {
                    avatarUrl = uploadInfo.url
                }
            }

            let hash = makeHash(password);

            let newUser = new User({
                firstName,
                lastName,
                fullName: firstName + (lastName ? (" " + lastName) : ""),
                role: role !== "ADMIN" ? role : "USER",
                email: email,
                password: hash,
                avatar: avatarUrl
            });

            newUser = await newUser.save();
            if (!newUser) {
                let error = new Error("Registration fail. please try again")
                return next(error)
            }

            let {password: s, ...other} = newUser;

            let token = await createToken(newUser._id, newUser.email, newUser.role);

            res.status(201).json({user: other, token});

        } catch (ex) {
            if (ex.type === "VALIDATION_ERROR") {
                next(ex.errors);
            } else if (ex.type === "ER_DUP_ENTRY") {
                next("user already exists");
            } else {
                next(ex);
            }
        }
    });
};


export const authLoad = async (req, res, next) => {

    let token = getToken(req)

    try {
        let data = await parseToken(token)

        if (!data) {
            return res.status(409).json({message: "Please login first"})
        }

        let user = await User.findOne({_id: new ObjectId(data._id)})

        if (!user) {
            return res.status(409).json({message: "Please login first"})
        }

        user["password"] = null

        res.status(201).json({
            user,
        })

    } catch (ex) {
        next(ex)
    }
}


export const updateProfile = (req, res, next) => {

    // parse a file upload
    const form = formidable({multiples: false});

    form.parse(req, async (err, fields, files) => {
        if (err) return next("Can't read form data");
        try {
            const {
                avatar,
                status,
                isBlocked,
                userId,
            } = fields;

            let user = await User.findOne({_id: new ObjectId(req.user._id)});
            if (!user) {
                return res.status(404).json({message: "User not found"});
            }

            let update = {}
            let errorMessage = ""
            if (avatar) update["avatar"] = avatar
            const newPhotos = []


            if (files && files.avatar) {
                let fileName = `${files.avatar.newFilename}-${files.avatar.originalFilename}`
                let result = await imageKitUpload(files.avatar.filepath, fileName, "hotel-booking")
                if (result) {
                    update["avatar"] = result.url
                    newPhotos.push(result.url)
                } else {
                    errorMessage = "Avatar upload fail"
                }
            }


            if (errorMessage) {
                return next(errorMessage)
            }


            let filter = {}
            // admin user can these for any users
            if (req.user.role === "ADMIN") {
                if (userId) {
                    filter["_id"] = new ObjectId(userId)
                } else {
                    filter["_id"] = new ObjectId(req.user._id)
                }
                if (status) update["status"] = status
                if (isBlocked) update["isBlocked"] = isBlocked == "true"

            }

            console.log(filter)

            await User.updateOne(filter, {
                $set: update
            })

            res.status(201).json({user: update});

        } catch (ex) {
            next(ex);
        }

    });
};


export const getUsers = async (req, res, next) => {
    try {
        let users = await User.find({});
        res.status(200).json({users: users})
    } catch (ex) {
        next(ex);
    }

};
