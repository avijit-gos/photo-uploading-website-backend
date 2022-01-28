const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token;
    if (!token) {
      return res.status(401).json({ msg: "Authentication error" });
    } else {
      const decode = jwt.verify(token, process.env.SECRET_KEY);
      next();
    }
  } catch (error) {
    return res.status(401).json({ msg: error.message });
  }
};
