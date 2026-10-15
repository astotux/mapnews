const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // TTL 1 час — MongoDB автоматически удалит документ
    }
});

module.exports = mongoose.model('resetToken', resetTokenSchema);
