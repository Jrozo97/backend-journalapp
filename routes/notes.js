const { Router } = require('express');
const { check } = require('express-validator');
const { fieldsValidator } = require('../middlewares/fields-validators');
const { validateJWT } = require('../middlewares/validator-jwt');
const { createNote, getNotes, updateNote, deleteNote, noteById } = require('../controllers/notes');
const router = Router();

router.use(validateJWT);

router.post('/', getNotes);

router.post('/create', [
    check('title', 'El título es obligatorio').not().isEmpty(),
    check('content', 'El contenido es obligatorio').not().isEmpty(),
    fieldsValidator
], createNote);

router.put('/update/:id',  updateNote);

router.delete('/delete/:id', deleteNote);

router.get('/:id', noteById);

module.exports = router;