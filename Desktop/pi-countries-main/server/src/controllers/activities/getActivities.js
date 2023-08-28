const { Activity } = require("../../db");

const getActivities = async () => {
  const activities = await Activity.findAll();
  return activities;
};

module.exports = getActivities;