//Importar dependecias
const { connection } = require("./database/connection");
const express = require("express");
const cors = require("cors");
//Mensaje bienvenida
console.log("API NODE para RED SOCIAL arrancada!!");

//Conexoin a bbdd
connection();
//Crear servidor node
const app = express();
const PORT = 3900;
//Configurar cors
app.use(cors());
//Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //Cualquier dato con form-urlencoded lo convierte en objeto usable de js
//Cargar conf rutas
const UserRoutes = require("./routes/user")
const PublicationRoutes = require("./routes/publication")
const FollowRoutes = require("./routes/follow")

app.use("/api/user",UserRoutes)
app.use("/api/publication",PublicationRoutes)
app.use("/api/follow",FollowRoutes)
//Ruta de prueba
app.get("/ruta-prueba", (req, res) => {
  return res.status(200).json({
    id: 1,
    nombre: "Joaquin",
    web: "victorroblesweb.es",
  });
});
//Poner serv a escuchar peticiones http
app.listen(PORT, ()=>{
    console.log("Servidor de node corriendo en el puerto:",PORT)
})