const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('Activity', {
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
       
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    difficulty:{
        type: DataTypes.INTEGER,
        validate:{
            min:1,
            max:5
        },
        allowNull: false
    },
    duration:{
        type: DataTypes.TIME,
    },
    season:{
        type: DataTypes.ENUM('Summer','Autum','Winter','Spring'),
        allowNull: false,
    },
  },
  {
    timestamps:false
  });
};