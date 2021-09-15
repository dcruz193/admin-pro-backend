const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');

const getUsuarios = async (req, res) => {

    const desde = Number(req.query.desde) || 0;
    console.log(desde);

    const usuarios = await Usuario.find( {}, 'nombre email role google img')
                                    .skip( desde)
                                    .limit( 1 );
    const total = await Usuario.count();

    res.json({
        ok: true,
        usuarios,
        uid: req.uid,
        total,
    })
}

const createUsuario = async (req, res = response ) => {

    const { email, password, nombre } = req.body;



    try {

        const existeEmail = await Usuario.findOne({ email });

        if ( existeEmail ) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya existe'
            });
        }

        const usuario = new Usuario( req.body );

        //Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password, salt );

        //Guardar usuario
        await usuario.save();

        const token = await generarJWT( usuario.id );
        
        res.json({
            ok: true,
            usuario,
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, revisar logs'
        });
    }


}

const actualizarUsuario = async ( req, res = response  ) => {
    
    // TODO: Validar token y comprobar si es el usuario correcto

    const uid = req.params.id;


    try {

        const usuarioDB = await Usuario.findById( uid );

        if ( !usuarioDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'El usuario no existe con ese id'
            });
        }

        //Actualizaciones
        const { password, google, email, ...campos} = req.body;

        if ( usuarioDB.email != email) {
            const existeEmail = await  Usuario.findOne({ email});
            if ( existeEmail ) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El usuario ya existe'
                });
            }
        }

        campos.email = email;

        const usuarioActualizado = await Usuario.findByIdAndUpdate( uid, campos, { new: true});

        res.json({
            ok: true,
            usuario: usuarioActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
        
    }
}

const borrarUsuario = async ( req, res = response ) => {
    
    const uid = req.params.id;
    
    try {

        const usuarioDB = await Usuario.findById( uid );

        if ( !usuarioDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'El usuario no existe con ese id'
            });
        }

        await Usuario.findOneAndDelete( uid );

        res.json({
            ok: true,
            msg: 'Usuario eliminado'
        });

    } catch (error) {
        console.log('Error', error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        }); 
    }

}

module.exports = {
    getUsuarios,
    createUsuario,
    actualizarUsuario,
    borrarUsuario
}