function requiredRoles(roles = []) {
    return function (req, res, next) {

        if (req.user && roles.includes(req.user.role)) {
            next()
        } else {
            res.status(401).json({message: "UnAuthorized"})
        }
    }
}

export default requiredRoles