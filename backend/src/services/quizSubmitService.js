import GameSession from "../models/gameSessionModel.js";

export async function submitAllAnswersService({ sessionId, userId, answers }) {
  const session = await GameSession.findOne({ sessionId });
  if (!session) throw new Error("Session not found");

  if (answers.length !== 10) throw new Error("Answers count must be 10");

  let totalCorrect = 0;
  let totalTime = 0;

  for (const ans of answers) {
    const q = session.questions.find((q) => q.id === ans.questionId);
    if (!q) throw new Error("Invalid questionId");

    if (ans.selectedOption === q.correctIndex) totalCorrect++;
    totalTime += ans.timeTaken;
  }

  const isP1 = session.player1Id === userId;
  const isP2 = session.player2Id === userId;

  if (isP1) {
    session.player1Answers = answers;
    session.player1Summary = { totalCorrect, totalTime };
  } else if (isP2) {
    session.player2Answers = answers;
    session.player2Summary = { totalCorrect, totalTime };
  }

  await session.save();

  const done =
    session.player1Summary !== null && session.player2Summary !== null;

  return done
    ? { message: "ready-for-winner", sessionId }
    : { message: "waiting-for-opponent" };
}
