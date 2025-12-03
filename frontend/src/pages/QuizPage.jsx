import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitAllAnswers } from "../api/api";

export default function QuizPage() {
  const navigate = useNavigate();
  
  // 1. SAFE LOCAL STORAGE ACCESS
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const questions = session.questions || [];

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());

  const [optionLocked, setOptionLocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  
  // State for Waiting Room
  const [waiting, setWaiting] = useState(false);

  // ---------------------------------------------
  // 2. ROBUST POLLING EFFECT
  // ---------------------------------------------
  useEffect(() => {
    if (!waiting) return; // Only run if waiting

    const interval = setInterval(async () => {
      try {
        const body = {
          sessionId: session.sessionId,
          userId: user._id,
          answers, // Uses current answers state
        };

        const res = await submitAllAnswers(body);

        if (res.data.message === "ready-for-winner") {
          clearInterval(interval);
          localStorage.setItem("resultSessionId", res.data.sessionId);
          navigate("/result");
        }
      } catch (err) {
        console.error("Polling Error:", err);
      }
    }, 2000); // Poll every 2 seconds

    // CLEANUP: If user leaves page, stop polling
    return () => clearInterval(interval);
  }, [waiting, navigate, session.sessionId, user._id, answers]);


  // ---------------------------------------------
  // GAME LOGIC
  // ---------------------------------------------
  const handleOptionClick = (selectedOptionIndex) => {
    if (optionLocked) return;

    setOptionLocked(true);
    setSelectedOption(selectedOptionIndex);

    const timeTaken = Date.now() - startTime;
    const answer = {
      questionId: questions[current].id,
      selectedOption: selectedOptionIndex,
      timeTaken,
    };

    setAnswers((prev) => [...prev, answer]);

    if (current < 9) {
      setTimeout(() => {
        setCurrent(current + 1);
        setStartTime(Date.now());
        setSelectedOption(null);
        setOptionLocked(false);
      }, 250);
    }
  };

  const handleSubmit = async () => {
    setWaiting(true); // This triggers the useEffect above
  };

  // ---------------------------------------------
  // RENDER
  // ---------------------------------------------
  if (!session.questions) return <div>Error: No Session Found</div>;

  if (waiting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black text-white">
        <div className="bg-gray-900 p-10 rounded-2xl shadow-2xl max-w-md w-full text-center border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 animate-pulse">
            Waiting for opponent to finish...
          </h2>
          <p className="text-gray-400 text-sm">Do not refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black text-white p-4">
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl p-10 shadow-2xl border border-gray-700">
        
        <h2 className="text-3xl font-bold text-center mb-6 tracking-wide">
          Question {current + 1}/10
        </h2>

        <p className="mb-8 text-xl text-gray-200 text-center leading-relaxed">
          {questions[current].question}
        </p>

        <div className="space-y-4">
          {questions[current].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionClick(i)}
              disabled={optionLocked && current !== 9}
              className={`w-full p-4 rounded-xl transition-all duration-200 cursor-pointer border text-lg
                ${
                  selectedOption === i
                    ? "bg-indigo-600 text-white border-indigo-300 shadow-xl scale-[1.02]"
                    : "bg-gray-800 hover:bg-gray-700 border-gray-700"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {opt}
            </button>
          ))}
        </div>

        {current === 9 && (
          <button
            onClick={handleSubmit}
            disabled={answers.length !== 10 || waiting}
            className="mt-8 py-4 w-full bg-blue-600 hover:bg-blue-500 rounded-xl text-xl font-semibold cursor-pointer 
                       disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
          >
            {waiting ? "Submitting..." : "Submit Quiz"}
          </button>
        )}

      </div>
    </div>
  );
}