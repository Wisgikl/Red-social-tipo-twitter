const { Country, Activity } = require("../../db");

const getCountryById = async (countryId) => {
  const country = await Country.findOne({
    where: {
      id: countryId,
    },
    include: {
      model: Activity,
      attributes: ["name"],
      through: {
        attributes: [],
      },
    },
  });
  if (!country) throw Error("El pais no existe, ingresa un id valido");

  return country;
};

module.exports = getCountryById;