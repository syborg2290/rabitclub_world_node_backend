export const utils = (app) => {
  app.get("/getServerDate", async (req, res, next) => {
    try {
      const currentDate = new Date();
      return res.json(currentDate);
    } catch (err) {
      next(err);
    }
  });
};
