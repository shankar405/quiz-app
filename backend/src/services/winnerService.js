import GameSession from "../models/gameSessionModel.js";
import User from "../models/userModel.js";

export async function calculateWinner(sessionId) {
  const session = await GameSession.findOne({ sessionId });
  if (!session) throw new Error("Session not found");

  const p1 = session.player1Summary;
  const p2 = session.player2Summary;

  if (!p1 || !p2) throw new Error("Both players have not submitted");

  let winnerId = null;

  if (p1.totalCorrect > p2.totalCorrect) winnerId = session.player1Id;
  else if (p2.totalCorrect > p1.totalCorrect) winnerId = session.player2Id;
  else {
    if (p1.totalTime < p2.totalTime) winnerId = session.player1Id;
    else if (p2.totalTime < p1.totalTime) winnerId = session.player2Id;
    else winnerId = "tie";
  }

  // Get player names
  const player1 = await User.findById(session.player1Id);
  const player2 = await User.findById(session.player2Id);

  // Save winner
  session.winnerId = winnerId;
  session.status = "finished";
  session.endTime = new Date();
  await session.save();

  return {
    sessionId,
    winnerId,
    winnerName: winnerId === "tie" ? "tie" :
                winnerId.toString() === session.player1Id.toString() ? player1.username : player2.username,

    player1Name: player1.username,
    player2Name: player2.username,

    player1Correct: p1.totalCorrect,
    player2Correct: p2.totalCorrect,

    player1Time: p1.totalTime,
    player2Time: p2.totalTime,
  };
}
