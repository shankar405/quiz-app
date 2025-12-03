import axios from "axios";
import he from "he";
import { v4 as uuidv4 } from "uuid";

export async function getQuestionsFromAPI(level) {
  try {
    let difficulty = "easy";
    if (level === 2) difficulty = "medium";
    if (level >= 3) difficulty = "hard";

    // FIX: Inject the 'difficulty' variable into the URL
    const url = `https://opentdb.com/api.php?amount=10&category=18&difficulty=${difficulty}&type=multiple`;

    const response = await axios.get(url);
    const data = response.data;

    if (data.response_code !== 0 || !data.results || data.results.length < 10) {
      throw new Error("Failed to fetch questions");
    }

    const cleanQuestions = data.results.map((q) => {
      const cleanQuestion = he.decode(q.question);
      const correct = he.decode(q.correct_answer);
      const incorrects = q.incorrect_answers.map((a) => he.decode(a));

      const options = [correct, ...incorrects];
      const shuffled = shuffleArray(options);
      const correctIndex = shuffled.indexOf(correct);

      return {
        id: uuidv4(),
        question: cleanQuestion,
        options: shuffled,
        correctIndex: correctIndex,
      };
    });

    return cleanQuestions;

  } catch (error) {
    console.error("Quiz Fetch Error:", error.message);
    // Fallback or re-throw
    throw new Error("Could not generate quiz");
  }
}

function shuffleArray(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}