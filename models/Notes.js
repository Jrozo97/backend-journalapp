const { Schema, model } = require('mongoose');

const NoteSchema = Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    img: {
        type: String
    }
});

module.exports = model('Note', NoteSchema);