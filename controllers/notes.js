const { response } = require("express");
const Note = require("../models/Notes");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");



// Configuración de AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const getNotes = async (req, res = response) => {
  try {
    const { search, page = 1, limit = 5 } = req.query;
    let filter = {};

    // Si se proporciona un término de búsqueda, aplicarlo al filtro
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    // Obtener el total de registros sin paginar
    const totalRecords = await Note.countDocuments(filter);

    // Calcular el total de páginas
    const totalPages = Math.ceil(totalRecords / limit);

    // Calcular el índice de inicio para la paginación
    const startIndex = (page - 1) * limit;

    // Obtener las notas paginadas
    const notes = await Note.find(filter).limit(limit).skip(startIndex);

    // Respuesta con la información solicitada
    res.json({
      notes: notes,
      page: parseInt(page),
      totalPage: totalPages,
      totalRecords: totalRecords,
      error: false,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Por favor hable con el administrador",
    });
  }
};

const createNote = async (req, res = response) => {
  const { title, image } = req.body;

  try {
    let note = await Note.findOne({ title });
    if (note) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe una nota con ese título",
      });
    }

    let imageURL = null;

    if (image) {
      // Decoficar la imagen de base64
      const base64Data = new Buffer.from(image, "base64");

      // Necesito sacar el tipo de la imagen despues de decodificar la  imagen en base64Data
      const type = image.split(";")[0].split("/")[1];
      const name = uuidv4();

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${name}.${type}`,
        Body: base64Data,
        ACL: "public-read",
        ContentType: `image/${type}`,
      };

      s3.upload(params, async (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            ok: false,
            msg: "Error al subir la imagen",
          });
        }

        imageURL = data.Location;

        const newNote = new Note({
          title,
          image: imageURL,
        });

        const noteSaved = await newNote.save();
        res.json({
          ok: true,
          note: noteSaved,
        });
      });
    } else {
      const newNote = new Note({
        title,
        image: imageURL,
      });

      const noteSaved = await newNote.save();
      res.json({
        ok: true,
        note: noteSaved,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Por favor hable con el administrador",
    });
  }
};


const updateNote = async (req, res = response) => {
  const noteId = req.params.id;
  const uid = req.uid;

  try {
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({
        ok: false,
        msg: "La nota no existe",
      });
    }

    if (note.user.toString() !== uid) {
      return res.status(401).json({
        ok: false,
        msg: "No tiene privilegios para editar esta nota",
      });
    }

    // Obtener los campos actualizados desde req.body
    const { title, description, image } = req.body;

    // Inicializar un objeto para almacenar los campos actualizados
    const updatedFields = {};

    // Verificar y actualizar los campos según corresponda
    if (title) updatedFields.title = title;
    if (description) updatedFields.description = description;

    // Si hay una nueva imagen, cargarla en AWS S3
    if (image) {
      // Decoficar la imagen de base64
      const base64Data = new Buffer.from(image, "base64");

      // Obtener el tipo de la imagen
      const type = image.split(";")[0].split("/")[1];
      const name = uuidv4();

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${name}.${type}`,
        Body: base64Data,
        ACL: "public-read",
        ContentType: `image/${type}`,
      };

      // Cargar la nueva imagen
      const uploadedImage = await s3.upload(params).promise();

      // Actualizar la URL de la imagen en el objeto de campos actualizados
      updatedFields.image = uploadedImage.Location;

      // Si la nota tenía una imagen previamente, eliminarla del bucket de AWS S3
      if (note.image) {
        const oldKey = note.image.split('/').pop(); // Obtener el nombre del archivo de la URL de la imagen actual
        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: oldKey,
        };
        await s3.deleteObject(deleteParams).promise();
      }
    }

    // Actualizar la nota con los campos actualizados
    const updatedNote = await Note.findByIdAndUpdate(noteId, updatedFields, { new: true });

    res.json({
      ok: true,
      note: updatedNote,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Por favor hable con el administrador",
    });
  }
};

const deleteNote = async (req, res = response) => {
  const noteId = req.params.id;
  const uid = req.uid;

  try {
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({
        ok: false,
        msg: "La nota no existe",
      });
    }

    if (note.user.toString() !== uid) {
      return res.status(401).json({
        ok: false,
        msg: "No tiene privilegios para eliminar esta nota",
      });
    }

    if (note.image) {
      const oldKey = note.image.split('/').pop(); 
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: oldKey,
      };
      await s3.deleteObject(deleteParams).promise();
    }

    await Note.findByIdAndDelete(noteId);
    res.json({
      ok: true,
      msg: "Nota eliminada",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Por favor hable con el administrador",
    });
  }
};

const noteById = async (req, res = response) => {
  const noteId = req.params.id;
  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        ok: false,
        msg: "La nota no existe",
      });
    }
    res.json({
      ok: true,
      note,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Por favor hable con el administrador",
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  noteById,
};
