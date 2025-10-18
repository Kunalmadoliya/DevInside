const jwt = require("jsonwebtoken");

function createAuthMiddleware(roles = ["user"]) {
  return async function authMiddleware(req, res, next) {
    const token =
      res.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({success: false, message: "Unauthorized: No token provided"});
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      if (!decoded) {
        return res
          .status(401)
          .json({message: "Unauthorzied no Token Provided!"});
      }

      if (!roles.includes(decoded.roles)) {
        return res
          .status(403)
          .json({success: false, message: "Insufficient permissions"});
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({success: false, message: "Unauthorized: Invalid token"});
    }
  };
}

module.exports = {createAuthMiddleware};
