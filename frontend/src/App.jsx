import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsernamePage from "./pages/UsernamePage";
import MatchPage from "./pages/MatchPage";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UsernamePage />} />
        <Route path="/match" element={<MatchPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
