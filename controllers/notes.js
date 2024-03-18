const { response } = require("express");
const Note = require("../models/Notes");

const getNotes = async (req, res = response) => {
  const notes = await Note.find().populate("user", "name");
  res.json({
    ok: true,
    notes,
  });
};

const createNote = async (req, res = response) => {
  const note = new Note(req.body);

  try {
    note.user = req.uid;
    const noteSaved = await note.save();
    res.json({
      ok: true,
      note: noteSaved,
    });
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

    const newNote = {
      ...req.body,
      user: uid,
    };

    const noteUpdated = await Note.findByIdAndUpdate(noteId, newNote);
    res.json({
      ok: true,
      note: noteUpdated,
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

    await Note.findByIdAndDelete(noteId);
    res.json({
        ok: true,
        msg: "Nota eliminada",
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
