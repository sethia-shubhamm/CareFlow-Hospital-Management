import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }

    req.user = {
        id: decoded.id,
        role: decoded.role
    };

    next();
});

export default authMiddleware;
