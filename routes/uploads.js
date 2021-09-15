const { Router } = require("express");
const { fileUpload, retornaImagen } = require("../controllers/uploads");
const { validarJWT } = require("../middlewares/validar-jwt");


const router = Router();

const expresFileUpload = require('express-fileupload');

router.use(expresFileUpload());

router.put('/:tipo/:id',validarJWT ,fileUpload );
router.get('/:tipo/:foto' , retornaImagen );

module.exports = router;