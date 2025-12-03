import GameSession from "../models/gameSessionModel.js";
export async function submitAllAnswersService({ sessionId, userId, answers }) {
  if (!sessionId || !userId || !answers) {
    throw new Error("Missing data");
  }

  const session = await GameSession.findOne({ sessionId });
  if (!session) throw new Error("Session not found");

  const isPlayer1 = session.player1Id.toString() === userId;
  const isPlayer2 = session.player2Id.toString() === userId;

  if (!isPlayer1 && !isPlayer2) throw new Error("User not in session");

  if (answers.length !== 10) throw new Error("Invalid answer count");

  let totalCorrect = 0;
  let totalTime = 0;

  for (const ans of answers) {
    const q = session.questions.find(q => q.id === ans.questionId);
    if (!q) throw new Error("Invalid questionId");

    const isCorrect = ans.selectedOption === q.correctIndex;
    if (isCorrect) totalCorrect++;

    totalTime += ans.timeTaken;
  }

  if (isPlayer1) {
    session.player1Answers = answers;
    session.player1Summary = { totalCorrect, totalTime };
  } else {
    session.player2Answers = answers;
    session.player2Summary = { totalCorrect, totalTime };
  }

  await session.save();

  const bothDone = session.player1Summary && session.player2Summary;

  if (!bothDone) {
    return { message: "waiting-for-opponent" };
  }

  return {
    message: "ready-for-winner",
    sessionId: sessionId
  };
}

