//Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

//Importar clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;
//MIDDLEWARE de autenticacion
exports.auth = (req, res, next) => {
  //Comprobar si me llega la cabecera de auth
  if (!req.headers.authorization) {
    return res.status(403).json({
      status: "Error",
      message: "La peticion no tiene la cabecera de autorizacion",
    });
  }
  //Limpiar el token
  let token = req.headers.authorization.replace(/['"]+/g, "");
  //Decodifcar el token
  try {
    let payload = jwt.decode(token, secret);

    //Comprobar expiracion del token
    if (payload.exp <= moment().unix()) {
      return res.status(401).json({
        status: "Error",
        message: "Token expirado",
      });
    }
    //Agregar datos de usuario a request
    req.user = payload;
  } catch (error) {
    return res.status(404).json({
      status: "Error",
      message: "Token invalido",
    });
  }

  //Pasar a ejecucion de accion
  next();
};
