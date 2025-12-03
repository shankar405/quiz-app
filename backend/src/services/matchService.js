
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

//   // ----------------------------
//   // 1️⃣ CHECK IF USER IS ALREADY IN A SESSION
//   // ----------------------------
//   let existingSession = await GameSession.findOne({
//     $or: [
//       { player1Id: userEXIST._id },
//       { player2Id: userEXIST._id },
//     ],
//     status: "playing",
//   });

//   if (existingSession) {
//     const SESSION_TIMEOUT = 30 * 1000; // 30 seconds
//     const sessionAge =
//       Date.now() - new Date(existingSession.startTime).getTime();

//     const noAnswers =
//       (!existingSession.player1Answers ||
//         existingSession.player1Answers.length === 0) &&
//       (!existingSession.player2Answers ||
//         existingSession.player2Answers.length === 0);

//     // ----------------------------
//     // EXPIRE STALE SESSIONS
//     // ----------------------------
//     if (sessionAge > SESSION_TIMEOUT && noAnswers) {
//       existingSession.status = "finished";
//       await existingSession.save();
//       existingSession = null; // allow new match
//     } else if (existingSession) {
//       // ----------------------------
//       // VALID ACTIVE SESSION → RETURN IMMEDIATELY
//       // ----------------------------
//       const opponentId =
//         existingSession.player1Id.toString() === userId
//           ? existingSession.player2Id
//           : existingSession.player1Id;

//       const opponent = await User.findById(opponentId);

//       return {
//         status: "matched",
//         sessionId: existingSession.sessionId,
//         player1: userEXIST.username,
//         player2: opponent?.username || "unknown",
//         questions: existingSession.questions,
//       };
//     }
//   }

//   // ----------------------------
//   // 2️⃣ MATCHMAKING QUEUE
//   // ----------------------------
//   if (!queue[level]) queue[level] = [];

//   // Remove duplicate if user already exists
//   queue[level] = queue[level].filter((id) => id !== userId);

//   // If queue empty → wait
//   if (queue[level].length === 0) {
//     queue[level].push(userId);
//     return { message: "waiting" };
//   }

//   // Match with first in queue
//   const matchedId = queue[level].shift();
//   const matchedPlayer = await User.findById(matchedId);

//   // ----------------------------
//   // 3️⃣ FETCH QUESTIONS ONCE
//   // ----------------------------
//   const questions = await getQuestionsFromAPI(level);

//   // ----------------------------
//   // 4️⃣ CREATE NEW GAME SESSION
//   // ----------------------------
//   const session = await GameSession.create({
//     sessionId: uuidv4(),
//     player1Id: matchedPlayer._id,
//     player2Id: userEXIST._id,
//     questions,
//     status: "playing",
//     startTime: new Date(),
//     player1Answers: [],
//     player2Answers: [],
//   });

//   return {
//     status: "matched",
//     sessionId: session.sessionId,
//     player1: matchedPlayer.username,
//     player2: userEXIST.username,
//     questions: session.questions,
//   };
// }
import GameSession from "../models/gameSessionModel.js";
import User from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";
import { getQuestionsFromAPI } from "./quizService.js";

// Queue now stores Objects: { userId, timestamp }
const queue = {}; 

export async function match(username) {
  if (!username) throw new Error("No username");

  const user = await User.findOne({ username });
  if (!user) throw new Error("User not found");

  const level = user.level;
  const userId = user._id.toString();

  // Initialize queue level if not exists
  if (!queue[level]) queue[level] = [];

  // ---------------------------------------------
  // 1. CHECK FOR EXISTING ACTIVE SESSION
  // ---------------------------------------------
  const existing = await GameSession.findOne({
    $or: [{ player1Id: userId }, { player2Id: userId }],
    status: "playing",
  });

  if (existing) {
    // EDGE CASE: If session is older than 10 minutes, mark it dead and allow new match
    const diff = Date.now() - new Date(existing.startTime).getTime();
    if (diff > 10 * 60 * 1000) { 
        existing.status = "finished";
        existing.winnerId = "timeout";
        await existing.save();
        // Fall through to matching logic...
    } else {
        // Return active match
        return {
          status: "matched",
          sessionId: existing.sessionId,
          questions: existing.questions,
          player1: existing.player1Id, // You might want to return usernames here by fetching them
          player2: existing.player2Id,
        };
    }
  }

  // ---------------------------------------------
  // 2. CLEANUP QUEUE (The "Ghost Player" Fix)
  // ---------------------------------------------
  // Remove current user from queue (to prevent self-match or duplicates)
  queue[level] = queue[level].filter(item => item.userId !== userId);

  // Remove STALE users (users who haven't polled in 10 seconds)
  const NOW = Date.now();
  queue[level] = queue[level].filter(item => (NOW - item.timestamp) < 10000);

  // ---------------------------------------------
  // 3. MATCHMAKING LOGIC
  // ---------------------------------------------
  
  // If nobody valid is waiting -> Join Queue
  if (queue[level].length === 0) {
    queue[level].push({ userId, timestamp: NOW });
    return { message: "waiting" };
  }

  // Found an opponent!
  const opponentData = queue[level].shift();
  const opponentId = opponentData.userId;
  
  // Double check: Is opponent definitely not me?
  if (opponentId === userId) {
      queue[level].push({ userId, timestamp: NOW });
      return { message: "waiting" };
  }

  try {
    const opponent = await User.findById(opponentId);
    
    // EDGE CASE: Opponent might have started another game in a race condition
    // Ideally we check DB again, but for simple app, we proceed.

    // Fetch questions
    const questions = await getQuestionsFromAPI(level);

    // Create Session
    const session = await GameSession.create({
      sessionId: uuidv4(),
      player1Id: opponentId,
      player2Id: userId,
      questions,
      status: "playing",
      startTime: new Date(),
    });

    return {
      status: "matched",
      sessionId: session.sessionId,
      questions,
      player1: opponent.username,
      player2: user.username,
    };

  } catch (err) {
    console.error("Match error:", err);
    // If something breaks (like Quiz API), put opponent back in queue so they aren't lost
    queue[level].unshift(opponentData); 
    throw new Error("Failed to create match, please try again.");
  }
}