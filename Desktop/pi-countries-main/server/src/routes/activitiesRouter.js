const { Router } = require("express");
const createActivities = require("../controllers/activities/createActivities");
const getActivities = require("../controllers/activities/getActivities");

const activitiesRouter = Router();

activitiesRouter.post("/", async (req, res) => {
  const { name, difficulty, duration, season, countries } = req.body;

  try {
    if (!name || !difficulty || !season || !countries)return res.status(400).send("Falta informacion");

    const newActivity = await createActivities({
      name,
      difficulty,
      duration,
      season,
      countries,
    });

    res.status(200).send("Acitivity created succesfully");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

activitiesRouter.get("/", async (req, res) => {
  try {
    const activities = await getActivities();
    if (activities.length === 0) {
      res.status(400).send("No hay actividades");
    } else {
      res.status(200).json(activities);
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = activitiesRouter;