const { response } = require("express");
const bycrypt = require("bcryptjs");
const User = require("../models/User");
const { generateJWT } = require("../helpers/jwt");

const createUser = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
        return res.status(400).json({
            ok: false,
            msg: "Un usuario existe con ese correo",
        });
        }
        user = new User(req.body);
        // Encriptar contraseña
        const salt = bycrypt.genSaltSync();
        user.password = bycrypt.hashSync(password, salt);
        await user.save();
        // Generar JWT
        const token = await generateJWT(user.id, user.name);
        res.status(201).json({
            ok: true,
            uid: user.id,
            name: user.name,
            token,
        });
    }
    
    catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Por favor hable con el administrador",
        });
    }
}


const loginUser = async (req, res = response) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: "El usuario no existe con ese correo",
            });
        }
        // Confirmar los passwords
        const validPassword = bycrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: "Password incorrecto",
            });
        }
        // Generar JWT
        const token = await generateJWT(user.id, user.name);
        res.json({
            ok: true,
            uid: user.id,
            name: user.name,
            token,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Por favor hable con el administrador",
        });
    }
}

const renewToken = async (req, res = response) => {
    const { uid, name } = req;
    // Generar un nuevo JWT y retornarlo en esta petición
    const token = await generateJWT(uid, name);
    res.json({
        ok: true,
        uid,
        name,
        token,
    });
}

module.exports = {
    createUser,
    loginUser,
    renewToken,
};

