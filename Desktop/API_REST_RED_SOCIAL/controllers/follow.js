const Follow = require("../models/follow");
const User = require("../models/user");
const moongosePagination = require("mongoose-pagination")
const followService = require("../services/followService")
//Acciones de prueba
const pruebaFollow = (req, res) => {
  return res.status(200).json({
    message: "Mensaje enviado desde: controllers/follow.js",
  });
};

//Accion de seguir (dar follow)
const save = async (req, res) => {
  //Conseguir datos por body
  const params = req.body;
  //Sacar id del usuario identificado
  const identity = req.user;
  // Crear objeto modelo follow
  const userToFollow = new Follow({
    user: identity.id,
    followed: params.followed,
  });
  //Guardar objeto en bd
  const followStored = await userToFollow.save();
  if (!followStored) {
    return res.status(400).json({
      message: "No se ha podido seguir al usuario",
    });
  }
  return res.status(200).json({
    message: "Seguido correctamente",
    identity: req.user,
    data: followStored,
  });
};
//Accion de dejar de seguir (Dar unfollow)
const unfollow = async (req, res) => {
  //Recoger el id del usuario identificado
  const userId = req.user.id;
  //Recoger el id del usuario que sigo y quiero dejar de seguir
  const followedId = req.params.id;
  //Find de las coincidencias y hacer removove
  const followDeleted = await Follow.deleteOne({
    user: userId,
    followed: followedId,
  });
  if (!followDeleted) {
    return res.status(500).json({ message: "No has dejado de seguir a nadie" });
  }

  return res.status(200).json({
    message: "Se ha dejado de seguir al usuario",
  });
};

//Accion listado de users que estoy siguiendo
const following = async (req,res)=>{
  //Sacar el id del usuario identificado
  let userId = req.user.id
  //Comprobar si me llega el id por parametro en url
  if(req.params.id) userId = req.params.id
  //Comprobar si me llega la pagina, si no es la page 1
  let page = 1
  if(req.params.page) page = req.params.page
  //Usuarios por pagina que quiero mostrar
  const itemsPerPage = 5;
  //Find a follow,popular datos de los users y paginar con mongoose
  const follows = await Follow.find({user: userId})
  .populate("user followed", "-password -role -created_at -email -__v")
  .paginate(page, itemsPerPage)
  const totalUsers = await Follow.countDocuments();
  //Sacar un array de ids de los usuarios que me siguen y los que sigo como joaquin o aquel que este logeado
  let followUserIds = await followService.followUserId(req.user.id)
    return res.status(200).json({
      message: "Listado de usuarios que estoy siguiendo",
      pagina:req.params.page,
      follows,
      total_users:totalUsers,
      total_pages: Math.ceil(totalUsers / itemsPerPage),
      user_following:  followUserIds.following,
      user_follower:followUserIds.followers,
    });
    
  

  
}

//Accion listado de users que siguen a cualquier otro usuario  (followed => (seguido) o mis followers)
const followers = async (req,res)=>{
  //Sacar el id del usuario identificado
  let userId = req.user.id
  //Comprobar si me llega el id por parametro en url
  if(req.params.id) userId = req.params.id
  //Comprobar si me llega la pagina, si no es la page 1
  let page = 1
  if(req.params.page) page = req.params.page
  //Usuarios por pagina que quiero mostrar
  const itemsPerPage = 5;
  //Find a follow,popular datos de los users y paginar con mongoose
  const follows = await Follow.find({followed: userId})
  .populate("user", "-password -role -created_at -email -__v")
  .paginate(page, itemsPerPage)
  const totalUsers = await Follow.countDocuments();
  //Sacar un array de ids de los usuarios que me siguen y los que sigo como joaquin o aquel que este logeado
  let followUserIds = await followService.followUserId(req.user.id)
    return res.status(200).json({
      message: "Listado de usuarios que me siguen",
      pagina:req.params.page,
      follows,
      total_users:totalUsers,
      total_pages: Math.ceil(totalUsers / itemsPerPage),
      user_following:  followUserIds.following,
      user_follower:followUserIds.followers,
    });
  
}

module.exports = {
  pruebaFollow,
  save,
  unfollow,
  following,
  followers
};
