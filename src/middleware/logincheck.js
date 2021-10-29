const login = require("../auth/login");

const loginCheckMiddleware = (req, res, next) => {
  if (!login.isLogin(req)) {
    console.log("Access denied");
    console.log("loginCheck Middleware");
    res.status("403").json({
      error: "not logged in",
    });
  } else {
    next();
  }
}

module.exports = loginCheckMiddleware;
