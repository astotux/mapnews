const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: String,
    text: String,
    imageUrl: String,
    newsUrl: String,
    place_id: { type: mongoose.Schema.Types.ObjectId, ref: 'city' },
    source_id: { type: mongoose.Schema.Types.ObjectId, ref: 'source' },
    dateTime: { type: Date },
    time: String,
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    category: { type: String, default: 'Общество' }
});

module.exports = mongoose.model('news', newsSchema);