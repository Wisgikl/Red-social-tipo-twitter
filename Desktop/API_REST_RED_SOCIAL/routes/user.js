const express = require("express")
const router = express.Router();
const UserController = require("../controllers/user")
const check = require("../middlewares/auth")
const multer = require("multer")

//Configuracion de subida
const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, "./uploads/avatars")
    },

    filename:(req,file,cb)=>{
        cb(null, "avatar-" +Date.now()+"-"+file.originalname);
    }
})

const uploads = multer({storage});

//Definir rutas
router.get("/prueba-usuario", check.auth, UserController.pruebaUser)
router.post("/register",UserController.register)
router.post("/login",UserController.login)
router.get("/profile/:id",check.auth, UserController.profile)
router.get("/list/:page?",check.auth, UserController.list)
                  //   ^ Parametro opcional
router.put("/update",check.auth,UserController.update)
//Exportar router
router.post("/upload",[check.auth, uploads.single("file0")],UserController.upload)
router.delete("/user/:id",check.auth,UserController.deletes)
router.get("/avatar/:file",UserController.avatar)
router.get("/counters/:id",check.auth,UserController.counters)
module.exports = router;
