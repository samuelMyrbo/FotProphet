const mongoose = require('mongoose');

const Schema = mongoose.Schema;



const PredictionSchema = new Schema({
  matchId: {
    type: String,
    required: true,
  },
  predictedScore: {
    type: String,
    required: true,
  },
  predictionDate: {
    type: Date,
    default: Date.now,
  }
});


const TeamSchema = new Schema({
  position: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  team: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  }
});



const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  predictions: [PredictionSchema],  
  fullSquad: [TeamSchema]
});

module.exports = mongoose.model('User', UserSchema);

//---

