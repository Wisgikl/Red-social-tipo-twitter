const { Router } = require("express");
const getCountries = require("../controllers/countries/getCountries");
const getCountryById = require("../controllers/countries/getCountryById");
const getCountryByName = require("../controllers/countries/getCountryByName");

const countriesRouter = Router();

countriesRouter.get("/", async (req, res) => {
  const { name } = req.query;
  
  try {
    const result = name
      ? await getCountryByName(name)
      : await getCountries();
     
      res.status(200).json(result);
    } catch (error) {     
     
    res.status(400).json({ error: error.message });
  }
});

countriesRouter.get("/:countryId", async (req, res) => {
  const { countryId } = req.params;
  try {
    if(!countryId) throw Error ("Ingresa un ID")
    const country = await getCountryById(countryId);
    res.status(200).json(country);
  } catch (error) {
    res.status(400).send('El pais no existe');
  }
});

module.exports = countriesRouter;