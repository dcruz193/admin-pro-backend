const { response } = require("express");

const bcrypt = require('bcryptjs');


const Usuario = require("../models/usuario");
const { generarJWT } = require("../helpers/jwt");
const { googleVerify } = require("../helpers/google-verify");
const { getMenuFrontEnd } = require("../helpers/menu-frontend");


const login = async ( req, res= response ) => {

    const { email, password } = req.body;

    try {

        //Verificar email
        const usuarioDB = await Usuario.findOne({ email });

        if ( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                msg: 'Email no valida'
            });
        }

        // Verificar contraseña
        const validPassword = bcrypt.compareSync( password, usuarioDB.password );

        if ( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            });
        }

        //Genera JWT

        const token = await generarJWT( usuarioDB.id );

        res.json({
            ok: true,
            token,
            menu: getMenuFrontEnd( usuarioDB.role )
        });

    } catch (error) {

        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el adminstrador'
        });
    }
}

const googleSignIn = async ( req, res = response) => {

    const googleToken = req.body.token;

    try {

        const { name, email, picture } = await googleVerify( googleToken );

        const usuarioDB = await Usuario.findOne({ email });
        let usuario = usuarioDB;
        console.log(usuario);

        if ( !usuario ) {
            // si usuario no existe
            usuario = new Usuario({
                nombre: name,
                email,
                password: '@@@',
                img: picture,
                google: true
            });

        } else {
            // Existe usuario
            usuario = usuarioDB;
            usuario.google = true;
        }

        //Guardar en BD
        await usuario.save();

        //Genera JWT
        const token = await generarJWT( usuario.id )

        res.json({
            ok: true,
            token,
            menu: getMenuFrontEnd( usuario.role )
        });
        
    } catch (error) {
        console.log(error);
        res.status(401).json({
            ok: false,
            msg:'Token no es correcto'
        });
        
    }

}

const renewToken = async( req, res= response) => {

    const uid = req.uid;

    //Genera JWT
    const token = await generarJWT( uid );

    //Obtener usuario
    const usuario = await Usuario.findById( uid );

    res.json({
        ok: true,
        token,
        usuario,
        menu: getMenuFrontEnd( usuario.role )
    });
}

module.exports = {
    login,
    googleSignIn,
    renewToken
}