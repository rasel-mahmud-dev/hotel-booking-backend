import User from "src/models/User";
import {createToken} from "src/jwt";
import {compare} from "src/hash";


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
