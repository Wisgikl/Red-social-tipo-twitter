//Importar dependencias y modulos
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Follow = require("../models/follow")
const Publication = require("../models/publication")
const jwt = require("../services/jwt");
const moongosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");
const validate = require("../helpers/validate")
//Acciones de prueba
const pruebaUser = (req, res) => {
  return res.status(200).json({
    message: "Mensaje enviado desde: controllers/user.js",
    usuario: req.user,
  });
};

//Registro de usuarios
const register = async (req, res) => {
  // Recoger datos de la petición
  const params = req.body;

  // Comprobar que me llegan bien (+validación)
  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({
      status: "Error",
      message: "Faltan datos por enviar",
    });
  }
  //Validacion avanzada
  try{
    validate(params)
  }catch(error){
    return res.status(400).json({
      status: "Error",
      message: "Validacion no superada",
    });
  }
  try {
    // Control usuarios duplicados
    const userEmail = await User.findOne({ email: params.email });
    const userNick = await User.findOne({ nick: params.nick });
    if (userEmail || userNick) {
      return res.status(500).json({
        status: "Error",
        message: "El usuario ya existe",
      });
    }
    // Cifrar la contraseña
    let hash = await bcrypt.hash(params.password, 10);
    params.password = hash;

    // Crear objeto de usuario
    let user_to_save = new User(params);

    // Guardar usuario en la base de datos
    const usersStored = await user_to_save.save(); // Cambio aquí

    // Devolver resultado
    return res.status(200).json({
      status: "Success",
      message: "Usuario registrado correctamente",
      user: usersStored,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "Error en la consulta de usuarios",
    });
  }
};

const login = async (req, res) => {
  //recoger parametros
  const params = req.body;

  if (!params.email || !params.password) {
    return res.status(400).json({
      status: "Error",
      message: "Faltan datos por enviar",
    });
  }
  try {
    //buscar en la bd si existe
    const user = await User.findOne({ email: params.email }); //.select({"password":0});
    if (!user) {
      return res.status(404).json({
        status: "Error",
        message: "No existe el usuario",
      });
    }
    //comprobar su contraseña
    const hash = bcrypt.compareSync(params.password, user.password);
    if (!hash) {
      return res.status(400).json({
        status: "Error",
        message: "No te has identificado correctamente",
      });
    }
    // Conseguir Token
    const token = jwt.createToken(user);

    //Datos del user
    return res.status(200).json({
      status: "Success",
      message: "Te has identificado correctamente",
      user: {
        id: user._id,
        name: user.name,
        nick: user.nick,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "Error en el servidor",
    });
  }
};

const profile = async (req, res) => {
  //Recibir el parametro del id de usuario por la url
  const id = req.params.id;
  try {
    //Consulta para sacar los datos del usuario
    const userProfile = await User.findById(id).select({
      password: 0,
      role: 0,
    });
    if (!userProfile) {
      return res.status(404).json({
        status: "Error",
        message: "El usuario no existe o hay un error",
      });
    }

    //Info de seguimiento
    const followInfo = await followService.followThisUser(id, req.user.id);

    //Devolver el resultado

    return res.status(200).json({
      status: "Success",
      message: "Perfil solicitado con exito",
      user: userProfile,
      following: followInfo.following,
      follower: followInfo.follower,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "Error en el servidor",
    });
  }
};

const list = async (req, res) => {
  // Controlar en que pagina estamos
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  page = parseInt(page);
  // Consulta con mongoose paginate
  let itemsPerPage = 5;
  try {
    const users = await User.find()
      .sort("_id")
      .paginate(page, itemsPerPage)
      .select("-password -email -__v -role")
      .exec();
    const totalUsers = await User.countDocuments();
    //Sacar un array de ids de los usuarios que me siguen y los que sigo como joaquin o aquel que este logeado
    let followUserIds = await followService.followUserId(req.user.id);
    return res.status(200).json({
      status: "success",
      users,
      page,
      itemsPerPage,
      total_users: totalUsers,
      total_pages: Math.ceil(totalUsers / itemsPerPage),
      user_following:  followUserIds.following,
      user_follower:followUserIds.followers,
    });
  } catch (error) {
    return res.status(404).json({
      status: "error",
      message: "No hay usuarios disponibles",
      error,
    });
  }
};

const update = async (req, res) => {
  // Recoger info del usuario a actualizar
  const userIdentity = req.user;
  // ^Es el id
  const userToUpdate = req.body;
  // ^Son los datos que envía el usuario
  // Eliminar campos sobrantes
  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;
  delete userToUpdate.image;
  // Comprobar si el usuario existe
  try {
    const users = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() },
      ],
    });

    let userIsset = false;
    users.forEach((user) => {
      if (user && user._id != userIdentity.id) userIsset = true;
    });
    if (userIsset) {
      return res.status(200).json({
        status: "Success",
        message: "El usuario ya existe",
      });
    }

    // Cifrar la contraseña
    if (userToUpdate.password) {
      let hash = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = hash;
    }else{
      delete userToUpdate.password;
      //Si la contra no me llega rellena elimino el campo de pwd para que no sobreescriba en la bd
    }

    // Buscar y actualizar con la nueva información
    const userUpdated = await User.findByIdAndUpdate(
      userIdentity.id,
      userToUpdate,
      { new: true } /*Devuelve los datos actualizados */
    );

    if (!userUpdated) {
      return res.status(400).json({
        status: "Error",
        message: "Error al actualizar el usuario",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Perfil actualizado con éxito",
      user: userUpdated,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Error al actualzar" });
  }
};

const upload = async (req, res) => {
  //Recoger el fichero de imagen y comprobar que existe
  if (!req.file) {
    return res.status(404).json({ message: "No has subido ninguna imagen" });
  }
  //Conseguir el name del archivo
  let image = req.file.originalname;
  //Sacar la extension del archivo
  const imageSplit = image.split(".");
  const extension = imageSplit[1];
  //Comprobar extension
  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    // Si no es correcta, Borrar archivo subido
    const filePath = req.file.path;
    const fileDeleted = fs.unlinkSync(filePath);
    return res.status(400).json({ message: "La extension no es compatible" });
  }

  //Si es correcta, guardar img en bd
  const userUpdate = await User.findOneAndUpdate(
    { _id: req.user.id },
    { image: req.file.filename },
    { new: true }
  );
  if (!userUpdate)
    return res.status(500).json({ message: "Error en la envio del avatar" });

  //Devolver respuesta
  return res.status(200).json({
    status: "Success",
    message: "Subida de imagen exitosa",
    user: userUpdate,
    file: req.file,
  });
};

const avatar = (req, res) => {
  //Sacar el parametro de la url
  const file = req.params.file;
  //Montar el path real de la imagen
  const filePath = "./uploads/avatars/" + file;

  //Comprobar que el archivo existe
  fs.stat(filePath, (error, exists) => {
    if (!exists)
      return res.status(404).json({ message: "El archivo no existe" });

    //Devolver un file
    return res.sendFile(path.resolve(filePath));
    //^ Es un metodo para enviar archivos
  });
};

const deletes = async (req, res) => {
  const user_id = req.params.id;

  try {
    const user_deleted = await User.findOneAndDelete({ _id: user_id });

    if (!user_deleted) {
      return res.status(404).json({ message: "Error al borrar el usuario" });
    }

    return res.status(200).json({
      status: "Success",
      message: "Usuario eliminado...",
      usuario: user_deleted,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};
const counters = async (req,res)=>{
  let userId = req.user.id

  if(req.params.id) userId = req.params.id

  try {
    const following = await Follow.count({"user":userId})

    const followed = await Follow.count({"followed":userId})

    const publications = await Publication.count({"user":userId})

    return res.status(200).json({
      userId,
      following:following,
      followed:followed,
      publications:publications
    })
  } catch (error) {
    
  }

}
module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
  deletes,
  counters
};
