const {Activity} = require("../../db")

const createActivities = async({name, difficulty, duration, season, countries}) =>{

    const newActivity = await Activity.create({    
        name,
        difficulty,
        duration,
        season
    })

    // relates the activity with a country
    newActivity.addCountries(countries)
    return newActivity;
}

module.exports = createActivities;