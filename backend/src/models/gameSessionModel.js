import mongoose from "mongoose";

const gameSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    unique: true,
    required: true,
  },

  player1Id: String,
  player2Id: String,

  questions: Array,

  player1Answers: { type: Array, default: [] },
  player2Answers: { type: Array, default: [] },

  player1Summary: { type: Object, default: null },
  player2Summary: { type: Object, default: null },

  status: {
    type: String,
    enum: ["pending", "playing", "finished"],
    default: "pending",
  },

  startTime: Date,
  endTime: Date,

  winnerId: String,
});

const GameSession = mongoose.model("GameSession", gameSessionSchema);
export default GameSession;
