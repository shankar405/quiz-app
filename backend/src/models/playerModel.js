import mongoose from "mongoose";

const playerAnswerSchema= new mongoose.Schema({
    sessionId:{
        type:String,
        required:true,
    },
    playerId:{
        type:String,
    },
    
    questionIndex:{
        type:Number
    },
    selectedOption:{
        type:String
    },
    isCorrect:{
        type:Boolean
    },
    timeTaken:{
        type:Number
    }
  
},{
    timestamps:true
}
)
const PlayerAnswer=mongoose.model("PlayerAnswer",playerAnswerSchema);
export default PlayerAnswer;