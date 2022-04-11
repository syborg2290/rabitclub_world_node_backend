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

  app.get("/isLogged/:id", authMiddleware, async (req, res, next) => {
    try {
      const id = req.params.id;

      if (!id) {
        return res.sendStatus(404);
      }
      const { data } = await service.IsLogged(id, res);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/setLogged", authMiddleware, async (req, res, next) => {
    try {
      const token = req?.cookies?.token;
      const { status } = req.body;
      if (!token) {
        return res.sendStatus(404);
      }
      const { data } = await service.SetLogged(token, status, res);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/setOnline", authMiddleware, async (req, res, next) => {
    try {
      const token = req?.cookies?.token;
      const { status } = req.body;
      if (!token) {
        return res.sendStatus(404);
      }
      const { data } = await service.SetOnline(token, status, res);
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

  app.get("/allUsers/:page", authMiddleware, async (req, res, next) => {
    try {
      const token = req.cookies.token;
      const page = req.params.page;
      if (!token) {
        return res.sendStatus(404);
      }
      if (!page) {
        return res.sendStatus(404);
      }
      const { data } = await service.GetAllUsers(page, token, res);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/setOnlineRequestTime", authMiddleware, async (req, res, next) => {
    try {
      const token = req?.cookies?.token;
      if (!token) {
        return res.sendStatus(404);
      }
      const { data } = await service.SetOnlineRequestTime(token, res);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/user/:id", authMiddleware, async (req, res, next) => {
    try {
      const id = req.params.id;

      if (!id) {
        return res.sendStatus(404);
      }
      const { data } = await service.GetUserFromId(id, res);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/logout", authMiddleware, (req, res, next) => {
    try {
      res.clearCookie("token").send();
    } catch (err) {
      next(err);
    }
  });

  app.post("/update_cover", authMiddleware, async (req, res, next) => {
    try {
      const token = req.cookies.token;
      const { url } = req.body;
      if (!token) {
        return res.sendStatus(404);
      }
      const { data } = await service.UpdateCoverPic(token, url, res);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/followingUser", authMiddleware, async (req, res, next) => {
    try {
      const token = req.cookies.token;
      const { id } = req.body;
      if (!token) {
        return res.sendStatus(404);
      }
      const { data } = await service.followUser(token, id);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/amIFollowing/:id", authMiddleware, async (req, res, next) => {
    try {
      const token = req.cookies.token;
      const id = req.params.id;
      if (!token) {
        return res.sendStatus(404);
      }
      const { data } = await service.amIFollowing(token, id);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/update_profile", authMiddleware, async (req, res, next) => {
    try {
      const token = req.cookies.token;
      const {
        email,
        bio,
        profile_pic_small,
        profile_pic_medium,
        profile_pic_default,
      } = req.body;
      if (!token) {
        return res.sendStatus(404);
      }
      const { data } = await service.UpdateProfile(
        token,
        email,
        bio,
        profile_pic_small,
        profile_pic_medium,
        profile_pic_default,
        res
      );
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });
};
