import mongoose from "mongoose";

const gameSessionSchema= new mongoose.Schema({
    sessionId:{
        type:String,
        unique:true,
        required:true,
    },
    player1Id:{
        type:String,
    },
    player2Id:{
        type:String,
    },
    questions:{
        type:Array
    },
    player1Answers:{
        type:Array
    } ,
    player2Answers:{
        type:Array
    } ,
      player1Summary:{
        type:Object,
        default: null
    },
    player2Summary:{
        type:Object,
        default: null
    },
    status: {
    type: String,
    enum: [ 'pending','playing','finished'],
    default: 'pending'
  },
  startTime:{
    type:Date
  },
  endTime:{
    type:Date
  },
  winnerId:{
    type:String
  }
},{
    timestamps:true
}
)
const GameSession=mongoose.model("GameSession",gameSessionSchema);
export default GameSession;