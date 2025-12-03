import { useEffect, useState } from "react";
import { getWinner } from "../api/api";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";

export default function ResultPage() {
  const [winnerData, setWinnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
 const user = JSON.parse(localStorage.getItem("user"));
  function formatTime(ms) {
    return (ms / 1000).toFixed(2) + " sec";
  }

  useEffect(() => {
    const sessionId = localStorage.getItem("resultSessionId");

    const load = async () => {
      try {
        const res = await getWinner(sessionId);
        setWinnerData(res.data);
      } catch (err) {
        console.error("Winner API Error:", err);
      }
      setLoading(false);
    };

    load();
  }, []);

  if (loading || !winnerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-black text-white">
        <Card>
          <h2 className="text-xl animate-pulse">Calculating Winner...</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-black text-white p-4">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-6 text-white tracking-wide">
          Game Result
        </h1>

        {/* Winner */}
        {winnerData.winnerName === "tie" ? (
          <h2 className="text-yellow-400 text-center text-2xl font-semibold mb-8 drop-shadow-md">
            🤝 It's a Perfect Tie!
          </h2>
        ) : (
          <h2 className="text-green-400 text-center text-3xl font-bold mb-8 drop-shadow-lg">
            🏆 Winner: {winnerData.winnerName}
          </h2>
        )}

        {/* Player Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player 1 */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-md">
            <h3 className="text-xl font-semibold text-indigo-300 mb-2">
              {winnerData.player1Name}
            </h3>
            <p className="text-gray-300">Correct Answers:</p>
            <p className="text-lg font-bold text-white mb-2">
              {winnerData.player1Correct}
            </p>
            <p className="text-gray-300">Time Taken:</p>
            <p className="text-lg font-bold text-white">
              {formatTime(winnerData.player1Time)}
            </p>
          </div>

          {/* Player 2 */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-md">
            <h3 className="text-xl font-semibold text-indigo-300 mb-2">
              {winnerData.player2Name}
            </h3>
            <p className="text-gray-300">Correct Answers:</p>
            <p className="text-lg font-bold text-white mb-2">
              {winnerData.player2Correct}
            </p>
            <p className="text-gray-300">Time Taken:</p>
            <p className="text-lg font-bold text-white">
              {formatTime(winnerData.player2Time)}
            </p>
          </div>
        </div>

        {/* Divider */}
     
        <div className="my-8 border-t border-gray-700" />
   <div className="text-center text-xl font-semibold mb-6">
          {winnerData.winnerId === "tie" ? (
            <span className="text-yellow-400">🤝 You tied the match.</span>
          ) : winnerData.winnerId === user._id ? (
            <span className="text-green-400">🎉 You Won!</span>
          ) : (
            <span className="text-red-400">😢 You Lost!</span>
          )}
        </div>
        {/* Play Again Button */}
        <button
          onClick={() => {
            localStorage.removeItem("session");
            localStorage.removeItem("resultSessionId");
            navigate("/match");
          }}
          className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}
