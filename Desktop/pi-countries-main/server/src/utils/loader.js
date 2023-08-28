const axios = require("axios");
const {Country} = require("../db")

const URL = "http://localhost:5000/countries";
const countriesLoader = async () => {

  try {
    const existCountries = await Country.findAll();
    
    if (existCountries.length === 0) {
      const response = await axios.get(URL);
      const countries = response.data;

      const countriesData = countries.map((country) => {
        return {
          id: country.cca3,
          name: country.name.common,
          flagImage: country.flags.png,
          continent: country.continents[0],
          capital: country.capital ? country.capital[0] : "-",
          subregion: country.subregion,
          area: country.area,
          population: country.population,
        };
      });
      const countriesCreated = await Country.bulkCreate(countriesData);
      console.log("los paises se guardaron en la base de datos");
      return countriesCreated
    }
    
  return "No se encontraron paises para cargar en la base de datos"

  } catch (error) {
    console.error("Error fetching data:", error.message);
    throw error;
  }
};

module.exports = countriesLoader;