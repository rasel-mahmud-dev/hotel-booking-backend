import {parseToken} from "../jwt";
import getToken from "../utils/getToken";


function requiredAuth(req, res, next) {
    let token = getToken(req);

    if (!token) {
        req.user = null;
        return res.status(401).json({message: "Please login first"})
    }

    parseToken(token)
        .then((u) => {
            req.user = {
                _id: u._id,
                email: u.email,
                role: u.role,
            };
            next();
        })
        .catch((err) => {
            req.user = null;
            res.status(401).json({message: "Authorization, Please login first"})
        });
}

export default requiredAuth
