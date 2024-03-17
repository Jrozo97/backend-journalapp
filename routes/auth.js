
const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');

const { createUser, loginUser, renewToken } = require('../controllers/auth');
const { fieldsValidator } = require('../middlewares/fields-validators');
const { validateJWT } = require('../middlewares/validator-jwt');

router.post(
    "/register",
    [
        check("name", "El nombre es obligatorio").not().isEmpty(),
        check("email", "El email es obligatorio").isEmail(),
        check("phone", "El teléfono es obligatorio").not().isEmpty(),
        check("password", "El password debe de ser de 6 caracteres").isLength({ min: 6 }),
        fieldsValidator,
    ],
    createUser
);

router.post("/login",
    [
        check("email", "El email es obligatorio").isEmail(),
        check("password", "El password debe de ser de 6 caracteres").isLength({ min: 6 }),
        fieldsValidator,
    ],
    loginUser
);

router.get("/renew", validateJWT, renewToken);

module.exports = router;