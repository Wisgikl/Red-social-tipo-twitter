const Publication = require("../models/publication")
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService")
//Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).json({
      message: "Mensaje enviado desde: controllers/publication.js",
    });
  };

  //Guardar publicacion
  const save = async (req,res)=>{
    try {
    //Recoger datos del body
    const params = req.body;
    //Respuesta por si no me llegan datos
      if(!params) return res.status(400).json({message:"No has enviado ningun texto"})
    //Crear y rellenas el objeto del modelo
      let newPublication = new Publication(params);
      newPublication.user = req.user.id;
    //Guardar objeto en bdd
      const publicationStored = await newPublication.save()
      if(!publicationStored) return res.status(400).json({message:"No se ha guardado la publicacion"})

    return res.status(200).json({
      message:"Publicacion guardada con exito",
      Publication: publicationStored
    })
  } catch (error) {
      return res.status(500).json({
        message:"Ocurrio un error en el servidor",
        error:error
      })
  }
  }
  //Mostrar una publicacion
  const detailPublication = async (req,res)=>{
    //Recoger el id de la publication
    const publicationId = req.params.id;
    //Find de la condicion del id
    const publicationStored = await Publication.findById(publicationId)
    if(!publicationStored){
      return res.status(404).json({
        message:"No existe tal publicacion"
      })
    }
    return res.status(200).json({
      message:"Mostrar publicacion",
      publication:publicationStored
    })
  }
  //Eliminar publicaciones
  const remove = async (req,res)=>{
    const publication_id = req.params.id;

  try {
    const publication_deleted = await Publication.findOneAndDelete({ user:req.user.id,_id: publication_id });

    if (!publication_deleted) {
      return res.status(404).json({ message: "La publicacion no existe" });
    }

    return res.status(200).json({
      status: "Success",
      message: "Publicacion eliminada...",
      publication: publication_deleted,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar la publicacion" });
  }
  }
  //Listar publicaciones de un usuario
  const user = async (req,res)=>{
    try{
    //Sacar el id de usuario
    const userId = req.params.id;
    //Controlar la pagina
    let page = 1

    if(req.params.page) page = req.params.page;

    const itemsPerPage = 5;
    //Find,populate,ordenar,paginar
    const publications = await Publication.find({"user":userId})
    .sort("-created_at")
    .populate("user","-password -__v -role -email")
    .paginate(page, itemsPerPage)
    const totalPublications = await Publication.countDocuments();
    if(publications.length <= 0) return res.status(404).json({message:"No hay publicaciones para mostrar"})
    //Devolver respuesta
    return res.status(200).json({
      status: "Success",
      message: "Publicaciones del perfil",
      pagina:req.params.page,
      total_pages: Math.ceil(totalPublications / itemsPerPage),
      publications:publications,
    });

  }catch(error){
    return res.status(500).json({
      message:"Ocurrio un error en el servidor",
    })
  }
  
  }
  
  
  //Subir ficheros
  const upload = async (req, res) => {
    try{
    //Sacar publication id
    const publicationId = req.params.id;
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
    const publicationUpdate = await Publication.findOneAndUpdate(
      {_id: publicationId},//Subir una imagen a una publicacion en concreto
      { file: req.file.filename },
      { new: true }
    );
    if (!publicationUpdate)
      return res.status(500).json({ message: "Error en el envio de la publicacion" });
  
    //Devolver respuesta
    return res.status(200).json({
      status: "Success",
      message: "Subida de imagen exitosa",
      publication: publicationUpdate,
      file: req.file,
    });
  }catch(error){
    console.error("error:",error)
    return res.status(500).json({
      message:"Ocurrio un error en el servidor"
    })
  }
  };
  //Devolver archivos multimedia imagenes
  const media = (req, res) => {
    //Sacar el parametro de la url
    const file = req.params.file;
    //Montar el path real de la imagen
    const filePath = "./uploads/publications/" + file;
  
    //Comprobar que el archivo existe
    fs.stat(filePath, (error, exists) => {
      if (!exists)
        return res.status(404).json({ message: "El archivo no existe" });
  
      //Devolver un file
      return res.sendFile(path.resolve(filePath));
      //^ Es un metodo para enviar archivos
    });
  };

  //Listar todas las publicaciones (FEED)
  const feed = async (req,res)=>{
    //Sacar pagina actual
    let page = req.params.page
    if(req.params.page) page = req.params.page
    //Establecer numero de elementos por pagina
    let itemsPerPage = 5;
    //Sacar un array de identificadores de usuarios que yo sigo como usuario
     try {
      const myFollows = await followService.followUserId(req.user.id)
      //Find a publicaciones in, ordenar, popular y paginar
      const publications = await Publication.find({user: myFollows.following})
      .populate("user", "-password -role -__v -email")
      .sort("-created_at")
      .paginate(page,itemsPerPage)
      if(!publications) return res.status(404).json({message:"No hay publicaciones para mostrar"})
      const totalPublications = await Publication.countDocuments();
      return res.status(200).json({
        message:"Feed de publicaciones",
        following: myFollows.following,
        publications,
        total_Publications: totalPublications,
        pages: Math.ceil(totalPublications/itemsPerPage)
      })
     } catch (error) {
      return res.status(500).json({
        message:"No se han listado las publicaciones del feed",
        
      })
     }


    
  }
  module.exports = {
    pruebaPublication,
    save,
    detailPublication,
    remove,
    user,
    upload,
    media,
    feed
  };