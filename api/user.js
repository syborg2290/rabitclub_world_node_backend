import UserService from "../services/user_service.js";
import { body, validationResult } from "express-validator";
import { authMiddleware } from "../middlewares/auth.js";

export const user = (app) => {
  const service = new UserService();

  app.post(
    "/register",
    body("email").isEmail().isLength({ max: 50 }),
    body("password").isLength({ min: 8 }),
    body("username").isLength({ min: 3, max: 20 }),
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json({ message: errors.array({ onlyFirstError: true }) });
      }
      try {
        const { email, password, username } = req.body;
        const { data } = await service.SignUp(
          { email, password, username },
          res
        );
        return res.json(data);
      } catch (err) {
        next(err);
      }
    }
  );

  app.post("/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const { data } = await service.SignIn({ username, password }, res);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/user", authMiddleware, async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.sendStatus(404);
      }
      const { data } = await service.GetUser(token, res);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/logout", (req, res, next) => {
    try {
      res.clearCookie("token").send();
    } catch (err) {
      next(err);
    }
  });
};
