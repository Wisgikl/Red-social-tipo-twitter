const {Country, Activity} = require('../../db');
// const Activity = require('../models/Activity');

const getCountries = async () =>{
    const countries = await Country.findAll({
        include:{
            model: Activity,
            attributes: ["name"],
            through: {
                attributes:[]
            }
        }        
    });
   
    return countries
   
}

module.exports = getCountries;