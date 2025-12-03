// import GameSession from "../models/gameSessionModel.js";
// import User from "../models/userModel.js";
// import { v4 as uuidv4 } from "uuid";
// import { getQuestionsFromAPI } from "./quizService.js";

// const queue = {};

// export async function match(username) {
//   if (!username) throw new Error("Username required");

//   const userEXIST = await User.findOne({ username });
//   if (!userEXIST) throw new Error("User not found");

//   const level = userEXIST.level;
//   const userId = userEXIST._id.toString();

// const existingSession = await GameSession.findOne({
//   $or: [
//     { player1Id: userEXIST._id },
//     { player2Id: userEXIST._id }
//   ],
//   status: "playing"
// });

// if (existingSession) {
//   // determine opponent
//   const opponentId =
//     existingSession.player1Id.toString() === userId
//       ? existingSession.player2Id
//       : existingSession.player1Id;

//   const opponent = await User.findById(opponentId);

//   return {
//     status: "matched",
//     sessionId: existingSession.sessionId,
//     player1: userEXIST.username,
//     player2: opponent?.username || "unknown",
//     questions: existingSession.questions
//   };
// }
//   // ensure queue exists
//   if (!queue[level]) {
//     queue[level] = [];
//   }

//   // remove user if already in queue (prevent duplicates)
//   queue[level] = queue[level].filter(id => id !== userId);

//   // if empty → wait
//   if (queue[level].length === 0) {
//     queue[level].push(userId);
//     return { message: "waiting" };
//   }

//   // match with first waiting user
//   const matchedId = queue[level].shift();
//   const matchedPlayer = await User.findById(matchedId);

//   // fetch questions ONCE
//   const questions = await getQuestionsFromAPI(level);

//   // create game session
//   const session = await GameSession.create({
//     sessionId: uuidv4(),
//     player1Id: matchedPlayer._id,
//     player2Id: userEXIST._id,
//     questions,
//     status: "playing",
//     startTime: new Date()
//   });

//   return {
//     status: "matched",
//     sessionId: session.sessionId,
//     player1: matchedPlayer.username,
//     player2: userEXIST.username,
//     questions: session.questions
//   };
// }
import GameSession from "../models/gameSessionModel.js";
import User from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";
import { getQuestionsFromAPI } from "./quizService.js";

const queue = {};

export async function match(username) {
  if (!username) throw new Error("Username required");

  const userEXIST = await User.findOne({ username });
  if (!userEXIST) throw new Error("User not found");

  const level = userEXIST.level;
  const userId = userEXIST._id.toString();

  // ----------------------------
  // 1️⃣ CHECK IF USER IS ALREADY IN A SESSION
  // ----------------------------
  let existingSession = await GameSession.findOne({
    $or: [
      { player1Id: userEXIST._id },
      { player2Id: userEXIST._id },
    ],
    status: "playing",
  });

  if (existingSession) {
    const SESSION_TIMEOUT = 30 * 1000; // 30 seconds
    const sessionAge =
      Date.now() - new Date(existingSession.startTime).getTime();

    const noAnswers =
      (!existingSession.player1Answers ||
        existingSession.player1Answers.length === 0) &&
      (!existingSession.player2Answers ||
        existingSession.player2Answers.length === 0);

    // ----------------------------
    // EXPIRE STALE SESSIONS
    // ----------------------------
    if (sessionAge > SESSION_TIMEOUT && noAnswers) {
      existingSession.status = "finished";
      await existingSession.save();
      existingSession = null; // allow new match
    } else if (existingSession) {
      // ----------------------------
      // VALID ACTIVE SESSION → RETURN IMMEDIATELY
      // ----------------------------
      const opponentId =
        existingSession.player1Id.toString() === userId
          ? existingSession.player2Id
          : existingSession.player1Id;

      const opponent = await User.findById(opponentId);

      return {
        status: "matched",
        sessionId: existingSession.sessionId,
        player1: userEXIST.username,
        player2: opponent?.username || "unknown",
        questions: existingSession.questions,
      };
    }
  }

  // ----------------------------
  // 2️⃣ MATCHMAKING QUEUE
  // ----------------------------
  if (!queue[level]) queue[level] = [];

  // Remove duplicate if user already exists
  queue[level] = queue[level].filter((id) => id !== userId);

  // If queue empty → wait
  if (queue[level].length === 0) {
    queue[level].push(userId);
    return { message: "waiting" };
  }

  // Match with first in queue
  const matchedId = queue[level].shift();
  const matchedPlayer = await User.findById(matchedId);

  // ----------------------------
  // 3️⃣ FETCH QUESTIONS ONCE
  // ----------------------------
  const questions = await getQuestionsFromAPI(level);

  // ----------------------------
  // 4️⃣ CREATE NEW GAME SESSION
  // ----------------------------
  const session = await GameSession.create({
    sessionId: uuidv4(),
    player1Id: matchedPlayer._id,
    player2Id: userEXIST._id,
    questions,
    status: "playing",
    startTime: new Date(),
    player1Answers: [],
    player2Answers: [],
  });

  return {
    status: "matched",
    sessionId: session.sessionId,
    player1: matchedPlayer.username,
    player2: userEXIST.username,
    questions: session.questions,
  };
}
