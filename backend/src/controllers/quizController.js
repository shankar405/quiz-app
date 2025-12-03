import { submitAllAnswersService } from "../services/quizSubmitService.js";
import { calculateWinner } from "../services/winnerService.js";

export const submitAllAnswers = async (req, res) => {
  try {
    const response = await submitAllAnswersService(req.body);
    res.json(response);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
export const getWinnerController = async (req, res) => {
  try {
    const { sessionId } = req.params; // MUST BE PARAMS

    const result = await calculateWinner(sessionId);

    return res.json(result);
  } catch (err) {
    console.error("Winner API Error:", err.message);
    return res.status(400).json({ error: err.message });
  }
};
